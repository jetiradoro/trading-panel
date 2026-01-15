# Historial de Precios - Documentación Técnica

> Documentación técnica del sistema de historial de precios de símbolos

## Índice
- [Modelo de Datos](#modelo-de-datos)
- [Cambios en la Arquitectura](#cambios-en-la-arquitectura)
- [Endpoints API](#endpoints-api)
- [Lógica de Negocio](#lógica-de-negocio)
- [Migración de Datos](#migración-de-datos)

---

## Modelo de Datos

### `price_history`
Histórico de precios de símbolos para seguimiento de mercado.

**Campos**:
- `id` (String, PK) - Identificador único (CUID)
- `symbolId` (String, FK) - Símbolo asociado
- `price` (Float) - Precio registrado
- `date` (DateTime) - Fecha del precio
- `createdAt` (DateTime) - Fecha de registro

**Relaciones**:
- `symbol` → `symbols.id` (onDelete: Cascade)

**Índices**:
- `symbolId`

---

## Cambios en la Arquitectura

### Antes (Relación con Operaciones)
El historial de precios estaba relacionado directamente con operaciones:
```prisma
model price_history {
  id          String     @id @default(cuid())
  operationId String
  price       Float
  date        DateTime
  createdAt   DateTime   @default(now())
  operation   operations @relation(fields: [operationId], references: [id], onDelete: Cascade)
  @@index([operationId])
}
```

**Problemas**:
- Duplicación de datos: múltiples operaciones del mismo símbolo requerían múltiples registros de precio
- Falta de centralización: no había una fuente única de precios por símbolo
- Limitación funcional: no se podía gestionar el historial de precios independientemente de las operaciones

### Después (Relación con Símbolos)
El historial de precios ahora está relacionado con símbolos:
```prisma
model price_history {
  id        String   @id @default(cuid())
  symbolId  String
  price     Float
  date      DateTime
  createdAt DateTime @default(now())
  symbol    symbols  @relation("SymbolPriceHistory", fields: [symbolId], references: [id], onDelete: Cascade)
  @@index([symbolId])
}

model symbols {
  id           String          @id @default(cuid())
  code         String          @unique
  name         String
  logo         String?
  product      String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  operations   operations[]
  priceHistory price_history[] @relation("SymbolPriceHistory")
}
```

**Beneficios**:
- Centralización: un único historial de precios por símbolo
- Reutilización: todas las operaciones del mismo símbolo acceden al mismo historial
- Gestión independiente: CRUD completo desde la pantalla de detalle de símbolo
- Eficiencia: reducción de redundancia de datos

---

## Endpoints API

### Símbolos - Historial de Precios

**Base**: `/symbols/:symbolId/prices`

#### `POST /symbols/:symbolId/prices`
Añadir precio al historial de un símbolo.

**Parámetros URL**:
- `symbolId` (String) - ID del símbolo

**Body**:
```typescript
{
  price: number;    // Precio del símbolo
  date: string;     // Fecha del precio (ISO 8601)
}
```

**Response** (201):
```typescript
{
  id: string;
  symbolId: string;
  price: number;
  date: string;
  createdAt: string;
}
```

**Errores**:
- `404` - Símbolo no encontrado
- `400` - Datos inválidos

---

#### `GET /symbols/:symbolId/prices`
Obtener historial de precios de un símbolo.

**Parámetros URL**:
- `symbolId` (String) - ID del símbolo

**Response** (200):
```typescript
[
  {
    id: string;
    symbolId: string;
    price: number;
    date: string;
    createdAt: string;
  }
]
```

**Ordenamiento**: Descendente por fecha (`date DESC`)
**Rango**: Solo último año (por `date`)

**Errores**:
- `404` - Símbolo no encontrado

---

#### `PUT /symbols/:symbolId/prices/:priceId`
Actualizar precio del historial.

**Parámetros URL**:
- `symbolId` (String) - ID del símbolo
- `priceId` (String) - ID del precio

**Body**:
```typescript
{
  price?: number;    // Precio actualizado (opcional)
  date?: string;     // Fecha actualizada (opcional)
}
```

**Response** (200):
```typescript
{
  id: string;
  symbolId: string;
  price: number;
  date: string;
  createdAt: string;
}
```

**Errores**:
- `404` - Precio no encontrado o no pertenece al símbolo
- `400` - Datos inválidos

---

#### `DELETE /symbols/:symbolId/prices/:priceId`
Eliminar precio del historial.

**Parámetros URL**:
- `symbolId` (String) - ID del símbolo
- `priceId` (String) - ID del precio

**Response** (200):
```typescript
{
  id: string;
  symbolId: string;
  price: number;
  date: string;
  createdAt: string;
}
```

**Errores**:
- `404` - Precio no encontrado o no pertenece al símbolo

---

### Operaciones - Cambios

#### Eliminado: `POST /operations/:id/prices`
Este endpoint ha sido eliminado. Los precios ahora se gestionan desde `/symbols/:symbolId/prices`.

#### Modificado: `GET /operations`
Ahora incluye el precio más reciente del símbolo:

**Response**:
```typescript
[
  {
    id: string;
    accountId: string;
    userId: string;
    symbolId: string;
    product: string;
    type: string;
    status: string;
    balance: number | null;
    createdAt: string;
    updatedAt: string;
    symbol: {
      id: string;
      code: string;
      name: string;
      logo?: string;
      priceHistory: [  // Solo el precio más reciente
        {
          id: string;
          symbolId: string;
          price: number;
          date: string;
          createdAt: string;
        }
      ]
    };
    entries: [...];
    metrics?: {      // Solo para operaciones abiertas
      currentQty: number;
      avgBuyPrice: number;
      unrealizedPnL: number | null;
      pnlPercentage: number | null;
      currentInvestment: number | null;
      buyQty: number;
      sellQty: number;
    };
  }
]
```

#### Modificado: `GET /operations/:id`
Ahora incluye el precio más reciente del símbolo (igual que `GET /operations`).

---

#### Nuevo: `PUT /operations/:operationId/entries/:entryId`
Actualizar una entrada de una operación.

**Parámetros URL**:
- `operationId` (String) - ID de la operación
- `entryId` (String) - ID de la entrada

**Body**:
```typescript
{
  entryType?: string;  // 'buy' | 'sell' (opcional)
  quantity?: number;   // Cantidad (opcional)
  price?: number;      // Precio (opcional)
  tax?: number;        // Comisión (opcional)
  date?: string;       // Fecha ISO 8601 (opcional)
}
```

**Response** (200):
```typescript
{
  id: string;
  operationId: string;
  entryType: string;
  quantity: number;
  price: number;
  tax: number;
  date: string;
  createdAt: string;
}
```

**Errores**:
- `404` - Entrada no encontrada o no pertenece a la operación
- `400` - Datos inválidos

---

## Lógica de Negocio

### Símbolos - Servicio

**Archivo**: `api/src/symbols/symbols.service.ts`

#### `addPrice(symbolId: string, data: CreatePriceHistoryDto): Promise<any>`
Añade un precio al historial del símbolo.

**Validaciones**:
1. Verifica que el símbolo existe (`findOne`)
2. Convierte la fecha string a `DateTime`

**Proceso**:
```typescript
await this.findOne(symbolId);  // Lanza NotFoundException si no existe
return this.prisma.price_history.create({
  data: {
    symbolId,
    price: data.price,
    date: new Date(data.date),
  },
});
```

---

#### `getPrices(symbolId: string): Promise<any[]>`
Obtiene el historial de precios ordenado por fecha descendente.

**Validaciones**:
1. Verifica que el símbolo existe

**Proceso**:
```typescript
await this.findOne(symbolId);
return this.prisma.price_history.findMany({
  where: { symbolId },
  orderBy: { date: 'desc' },
});
```

---

#### `updatePrice(symbolId: string, priceId: string, data: UpdatePriceHistoryDto): Promise<any>`
Actualiza un precio del historial.

**Validaciones**:
1. Verifica que el precio existe
2. Verifica que el precio pertenece al símbolo
3. Solo actualiza campos presentes en el DTO

**Proceso**:
```typescript
const price = await this.prisma.price_history.findUnique({ where: { id: priceId } });
if (!price || price.symbolId !== symbolId) {
  throw new NotFoundException(`Price with id ${priceId} not found`);
}
const updateData: any = {};
if (data.price !== undefined) updateData.price = data.price;
if (data.date) updateData.date = new Date(data.date);
return this.prisma.price_history.update({ where: { id: priceId }, data: updateData });
```

---

#### `removePrice(symbolId: string, priceId: string): Promise<any>`
Elimina un precio del historial.

**Validaciones**:
1. Verifica que el precio existe
2. Verifica que el precio pertenece al símbolo

**Proceso**:
```typescript
const price = await this.prisma.price_history.findUnique({ where: { id: priceId } });
if (!price || price.symbolId !== symbolId) {
  throw new NotFoundException(`Price with id ${priceId} not found`);
}
return this.prisma.price_history.delete({ where: { id: priceId } });
```

---

### Operaciones - Servicio (Cambios)

**Archivo**: `api/src/operations/operations.service.ts`

#### `create(data: CreateOperationDto): Promise<any>` (Modificado)
Ahora inserta el precio inicial con `symbolId` en lugar de `operationId`:

```typescript
if (firstEntry) {
  await tx.price_history.create({
    data: {
      symbolId: symbolId,  // Antes: operationId
      price: firstEntry.price,
      date: new Date(firstEntry.date),
    },
  });
}
```

---

#### `findAll(filters): Promise<any[]>` (Modificado)
Ahora incluye `symbol.priceHistory` con solo el precio más reciente:

```typescript
const operations = await this.prisma.operations.findMany({
  where: { /* ... */ },
  include: {
    symbol: {
      include: {
        priceHistory: {
          orderBy: { date: 'desc' },
          take: 1,  // Solo el más reciente
        },
      },
    },
    account: true,
    entries: {
      orderBy: { date: 'asc' },
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

---

#### `findOne(id: string): Promise<any>` (Modificado)
Similar a `findAll`, incluye `symbol.priceHistory` con solo el precio más reciente.

---

#### `updateEntry(operationId: string, entryId: string, data: UpdateEntryDto): Promise<any>` (Nuevo)
Actualiza una entrada de una operación.

**Validaciones**:
1. Verifica que la entrada existe
2. Verifica que la entrada pertenece a la operación
3. Convierte la fecha string a `DateTime` si está presente

**Proceso**:
```typescript
const entry = await this.prisma.operation_entries.findUnique({ where: { id: entryId } });
if (!entry || entry.operationId !== operationId) {
  throw new NotFoundException(`Entry with id ${entryId} not found`);
}
const updateData: any = { ...data };
if (data.date) {
  updateData.date = new Date(data.date);
}
return this.prisma.operation_entries.update({ where: { id: entryId }, data: updateData });
```

---

## Migración de Datos

### Archivo
`api/prisma/migrations/20260110083600_change_price_history_relation/migration.sql`

### Estrategia
Migración multi-paso para preservar datos existentes:

1. **Añadir columna nullable**: `ALTER TABLE price_history ADD COLUMN symbolId VARCHAR(191);`
2. **Poblar datos**: `UPDATE price_history ph INNER JOIN operations o ON ph.operationId = o.id SET ph.symbolId = o.symbolId;`
3. **Hacer NOT NULL**: `ALTER TABLE price_history MODIFY symbolId VARCHAR(191) NOT NULL;`
4. **Eliminar FK antigua**: `ALTER TABLE price_history DROP FOREIGN KEY price_history_operationId_fkey;`
5. **Eliminar índice antiguo**: `DROP INDEX price_history_operationId_idx ON price_history;`
6. **Eliminar columna antigua**: `ALTER TABLE price_history DROP COLUMN operationId;`
7. **Crear índice nuevo**: `CREATE INDEX price_history_symbolId_idx ON price_history(symbolId);`
8. **Crear FK nueva**: `ALTER TABLE price_history ADD CONSTRAINT price_history_symbolId_fkey FOREIGN KEY (symbolId) REFERENCES symbols(id) ON DELETE CASCADE ON UPDATE CASCADE;`

### Consideraciones
- Los precios existentes se asocian al símbolo de la operación original
- Si múltiples operaciones del mismo símbolo tenían precios, ahora todos se consolidan en un único historial
- No se pierden datos durante la migración
- La migración es reversible (pero requeriría lógica adicional para determinar a qué operación asociar cada precio)

---

## DTOs

### Símbolos

**CreatePriceHistoryDto** (`api/src/symbols/dto/create-price-history.dto.ts`):
```typescript
export class CreatePriceHistoryDto {
  @IsNumber()
  price: number;

  @IsDateString()
  date: string;
}
```

**UpdatePriceHistoryDto** (`api/src/symbols/dto/update-price-history.dto.ts`):
```typescript
export class UpdatePriceHistoryDto {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
```

### Operaciones

**UpdateEntryDto** (`api/src/operations/dto/update-entry.dto.ts`):
```typescript
export class UpdateEntryDto {
  @IsOptional()
  @IsIn(['buy', 'sell'])
  entryType?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
```

---

## Testing

### Operaciones - Tests Actualizados

**Archivo**: `api/src/operations/operations.service.spec.ts`

**Cambios**:
1. Mock de transacción incluye `price_history.create`
2. Expectativas de `findAll` y `findOne` incluyen `symbol.priceHistory`
3. Añadido test suite para `updateEntry`
4. Eliminado test suite para `addPrice` (ya no existe)
5. Aserciones verifican presencia de `metrics` en operaciones abiertas

**Ejemplo**:
```typescript
it('should update entry in operation', async () => {
  const updateDto = { quantity: 2.0, price: 52000 };
  const updatedEntry = { ...mockEntry, ...updateDto };

  mockPrismaService.operation_entries.findUnique.mockResolvedValue(mockEntry);
  mockPrismaService.operation_entries.update.mockResolvedValue(updatedEntry);

  const result = await service.updateEntry('op-1', 'entry-1', updateDto);

  expect(prisma.operation_entries.findUnique).toHaveBeenCalledWith({
    where: { id: 'entry-1' },
  });
  expect(prisma.operation_entries.update).toHaveBeenCalledWith({
    where: { id: 'entry-1' },
    data: updateDto,
  });
  expect(result).toEqual(updatedEntry);
});
```

---

## Restricciones y Validaciones

### Base de Datos
- `symbolId` es NOT NULL y tiene FK a `symbols.id` con CASCADE
- Índice en `symbolId` para optimizar queries
- Cascade delete: al eliminar un símbolo, se eliminan sus precios

### Aplicación
- DTOs validan tipos de datos (número, fecha ISO 8601)
- Servicios verifican existencia de símbolo antes de operar
- Servicios verifican que el precio pertenece al símbolo en operaciones de update/delete
- Conversión automática de strings de fecha a objetos `DateTime`

---

## Impacto en Frontend

### OperationsStore

**Cambios en interfaces**:
```typescript
interface PriceHistory {
  id: string;
  symbolId?: string;  // Antes: operationId
  price: number;
  date: string;
  createdAt: string;
}

interface Operation {
  // ...
  symbol?: {
    id: string;
    code: string;
    name: string;
    logo?: string;
    priceHistory?: PriceHistory[];  // Nuevo
  };
  entries?: OperationEntry[];
  // Eliminado: prices?: PriceHistory[];
}
```

**Método añadido**:
```typescript
async updateEntry(operationId: string, entryId: string, payload: UpdateEntryDto) {
  const { data } = await api.put(`/operations/${operationId}/entries/${entryId}`, payload);
  if (this.currentOperation?.id === operationId) {
    await this.fetchOperationDetail(operationId);
  }
  return data;
}
```

**Método eliminado**:
```typescript
// async addPriceHistory(operationId: string, payload: NewPriceHistoryDto)
```

### SymbolsStore

**Métodos añadidos**:
```typescript
async fetchPriceHistory(symbolId: string): Promise<PriceHistory[]>
async addPriceHistory(symbolId: string, payload: NewPriceHistoryDto): Promise<PriceHistory>
async updatePriceHistory(symbolId: string, priceId: string, payload: UpdatePriceHistoryDto): Promise<PriceHistory>
async deletePriceHistory(symbolId: string, priceId: string): Promise<void>
```

### OperationDetailPage

**Cambios**:
- Eliminados componentes `PriceHistoryList` y `PriceForm`
- Añadido computed `currentPrice` que obtiene el precio más reciente de `operation.symbol.priceHistory[0]`
- Añadido soporte para editar entradas con `editingEntry` ref y método `handleEditEntry`
- Reemplazada card de historial de precios por card de precio actual

**Ejemplo**:
```typescript
const currentPrice = computed(() => {
  return operation.value?.symbol?.priceHistory?.[0];
});
```

### EntriesList

**Cambios**:
- Items ahora son clickables para editar
- Emit del evento `edit` al hacer clic en una entrada
- Botón de eliminar usa `@click.stop` para evitar propagación

### EntryForm

**Cambios**:
- Añadida prop `editEntry` para modo edición
- Computed `isEdit` para determinar si es creación o edición
- Watch sobre `editEntry` para poblar el formulario
- Título dinámico del diálogo
- Lógica de guardado que llama a `updateEntry` o `addEntry` según corresponda
