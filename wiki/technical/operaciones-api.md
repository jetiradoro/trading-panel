# Operaciones - Documentación Técnica API

> Documentación técnica del backend para desarrolladores

## Índice
- [Modelo de Datos](#modelo-de-datos)
- [Endpoints API](#endpoints-api)
- [Servicios](#servicios)
- [Lógica de Negocio](#lógica-de-negocio)
- [Restricciones y Validaciones](#restricciones-y-validaciones)

---

## Modelo de Datos

### `operations`
Tabla principal de operaciones de trading.

**Campos**:
- `id` (String, PK) - Identificador único (CUID)
- `accountId` (String, FK) - Cuenta asociada
- `userId` (String, Indexed) - Usuario propietario
- `symbolId` (String, FK) - Símbolo/activo
- `product` (String) - Tipo de producto: `crypto` | `stock` | `etf` | `derivative`
- `type` (String) - Tipo de operación: `long` | `short`
- `status` (String) - Estado: `open` | `closed` (default: `open`)
- `balance` (Float, Nullable) - Balance final (null hasta cerrar)
- `createdAt` (DateTime) - Fecha de creación
- `updatedAt` (DateTime) - Fecha de última actualización

**Relaciones**:
- `account` → `accounts.id` (onDelete: Cascade)
- `symbol` → `symbols.id`
- `entries` → `operation_entries[]`
- `prices` → `price_history[]`

**Índices**:
- `userId`, `accountId`, `symbolId`, `status`

---

### `operation_entries`
Entradas de compra/venta dentro de una operación.

**Campos**:
- `id` (String, PK) - Identificador único
- `operationId` (String, FK) - Operación padre
- `entryType` (String) - Tipo: `buy` | `sell`
- `quantity` (Float) - Cantidad de activos
- `price` (Float) - Precio unitario
- `tax` (Float) - Comisión/impuesto (default: 0)
- `date` (DateTime) - Fecha de la entrada
- `createdAt` (DateTime) - Fecha de creación

**Relaciones**:
- `operation` → `operations.id` (onDelete: Cascade)

**Índices**:
- `operationId`

---

### `price_history`
Histórico de precios para seguimiento de operaciones.

**Campos**:
- `id` (String, PK) - Identificador único
- `operationId` (String, FK) - Operación asociada
- `price` (Float) - Precio registrado
- `date` (DateTime) - Fecha del precio
- `createdAt` (DateTime) - Fecha de registro

**Relaciones**:
- `operation` → `operations.id` (onDelete: Cascade)

**Índices**:
- `operationId`

---

### `symbols`
Catálogo de símbolos/activos disponibles.

**Campos**:
- `id` (String, PK) - Identificador único
- `code` (String, Unique) - Código del símbolo (ej: BTC, AAPL)
- `name` (String) - Nombre completo
- `logo` (String, Nullable) - URL del logo
- `product` (String) - Tipo: `crypto` | `stock` | `etf` | `derivative`
- `createdAt` (DateTime) - Fecha de creación
- `updatedAt` (DateTime) - Fecha de actualización

**Relaciones**:
- `operations` → `operations[]`

---

## Endpoints API

**Base**: `/operations`
**Autenticación**: Requerida (AuthGuard) en todos los endpoints

### `POST /operations`
Crear nueva operación con entrada inicial opcional.

**Request Body**:
```typescript
{
  accountId: string;      // ID de la cuenta
  symbolId: string;       // ID del símbolo
  product: 'crypto' | 'stock' | 'etf' | 'derivative';
  type: 'long' | 'short';
  leverage?: number;     // Opcional (solo derivados, máx 2 decimales)
  firstEntry?: {
    entryType: 'buy' | 'sell';
    quantity: number;
    price: number;
    tax?: number;        // default: 0
    date: string;        // ISO 8601
  };
}
```

**Response**: `operations` object

**Comportamiento**:
- `userId` se asigna automáticamente del usuario autenticado
- Si se incluye `firstEntry`, se crea en la misma transacción
- Estado inicial: `open`

**Errores**:
- 400 - Validación fallida
- 401 - No autenticado

---

### `GET /operations`
Listar operaciones del usuario con filtros opcionales.

**Query Params**:
- `status?: string` - Filtrar por estado (`open` | `closed`)
- `product?: string` - Filtrar por producto (`crypto` | `stock` | `etf`)
- `symbolId?: string` - Filtrar por símbolo específico

**Response**: Array de `operations` con relaciones `symbol` y `account`

**Comportamiento**:
- Filtrado automático por `userId` del usuario autenticado
- Ordenamiento: primera entrada DESC (si no hay entries, usa `createdAt`)

---

### `GET /operations/:id`
Obtener detalle completo de una operación con cálculos en tiempo real.

**Path Params**:
- `id: string` - ID de la operación

**Response**:
```typescript
{
  id: string;
  accountId: string;
  userId: string;
  symbolId: string;
  product: string;
  type: string;
  status: string;
  balance: number | null;
  totalFees?: number;
  createdAt: Date;
  updatedAt: Date;
  symbol: {...};
  account: {...};
  entries: operation_entries[];  // ordenados por date ASC
  prices: price_history[];       // solo último precio (take: 1)
  metrics?: {                    // solo si status='open'
    currentQty: number;
    avgBuyPrice: number;
    buyQty: number;
    sellQty: number;
    unrealizedPnL: number | null;
  };
}
```

**Comportamiento**:
- Para operaciones abiertas, calcula métricas en tiempo real
- `unrealizedPnL` requiere al menos un precio en `price_history`
- Para operaciones cerradas, devuelve `balance` final sin `metrics`

**Errores**:
- 404 - Operación no encontrada

---

### `POST /operations/:id/entries`
Agregar entrada a una operación con cierre automático.

**Path Params**:
- `id: string` - ID de la operación

**Request Body**:
```typescript
{
  entryType: 'buy' | 'sell';
  quantity: number;
  price: number;
  tax?: number;        // default: 0
  date: string;        // ISO 8601
}
```

**Response**: `operation_entry` object

**Comportamiento**:
1. Crea la entrada en transacción
2. Verifica condición de cierre: `sum(buy.qty) == sum(sell.qty)`
3. Si se cumple:
   - Actualiza `status` a `closed`
   - Calcula y guarda `balance`
   - Todo en transacción atómica

**Errores**:
- 404 - Operación no encontrada
- 400 - Operación ya cerrada
- 400 - Validación fallida

---

### `PATCH /operations/:id/status`
Actualizar estado de la operación manualmente.

**Request Body**:
```typescript
{
  status: 'open' | 'closed';
}
```

**Comportamiento**:
- `closed`: calcula `balance` y actualiza estado
- `open`: limpia `balance` y actualiza estado
- Requiere autenticación

---

### `DELETE /operations/:id/entries/:entryId`
Eliminar una entrada de una operación.

**Path Params**:
- `id: string` - ID de la operación
- `entryId: string` - ID de la entrada

**Response**: `operation_entry` eliminado

**Validaciones**:
- Entrada debe existir
- Entrada debe pertenecer a la operación especificada

**Comportamiento**:
- Si la operación estaba `closed`, se reabre automáticamente (`status='open'`, `balance=null`)

**Errores**:
- 404 - Entrada no encontrada o no coincide

---

### `POST /operations/:id/prices`
Agregar precio histórico a una operación.

**Path Params**:
- `id: string` - ID de la operación

**Request Body**:
```typescript
{
  price: number;
  date: string;  // ISO 8601
}
```

**Response**: `price_history` object

**Errores**:
- 404 - Operación no encontrada
- 400 - Validación fallida

---

### `DELETE /operations/:id`
Eliminar una operación.

**Path Params**:
- `id: string` - ID de la operación

**Response**: `operation` eliminado

**Comportamiento**:
- Elimina en cascada todas las `entries` y `prices` asociadas

**Errores**:
- 404 - Operación no encontrada

---

## Servicios

### `OperationsService`

**Dependencias**:
- `PrismaService` - ORM para acceso a base de datos

#### Métodos Públicos

**`create(data: CreateOperationDto): Promise<operations>`**
- Crea operación con entrada inicial opcional
- Usa transacción si hay `firstEntry`
- Asigna `userId` automáticamente

**`findAll(filters): Promise<operations[]>`**
- Lista operaciones con filtros opcionales
- Filtra automáticamente por `userId`
- Incluye relaciones `symbol` y `account`

**`findOne(id: string): Promise<any>`**
- Obtiene detalle completo de operación
- Calcula `metrics` para operaciones abiertas
- Incluye último precio histórico

**`addEntry(operationId: string, data: CreateEntryDto): Promise<any>`**
- Agrega entrada con cierre automático
- Usa transacción atómica
- Calcula balance si se cierra

**`removeEntry(operationId: string, entryId: string): Promise<any>`**
- Elimina entrada de operación
- Valida que pertenezca a la operación

**`addPrice(operationId: string, data: CreatePriceHistoryDto): Promise<any>`**
- Agrega precio al histórico
- Usado para cálculo de unrealizedPnL

**`remove(id: string): Promise<operations>`**
- Elimina operación
- Cascada automática a entries y prices

#### Métodos Privados (Lógica de Negocio)

**`shouldCloseOperation(operationId: string, tx: any): Promise<boolean>`**
- Determina si operación debe cerrarse
- Condición: `sum(buy.qty) == sum(sell.qty) && buyQty > 0`
- Se ejecuta dentro de transacción

**`calculateBalance(operationId: string, operationType: string, tx: any): Promise<number>`**
- Calcula balance para operación cerrada
- Long: `sellTotal - buyTotal`
- Short: `buyTotal - sellTotal`
- Se ejecuta dentro de transacción

**`calculateMetrics(operation: any, currentPrice?: number)`**
- Calcula métricas para operaciones abiertas
- Retorna: `currentQty`, `avgBuyPrice`, `buyQty`, `sellQty`, `unrealizedPnL`
- `unrealizedPnL` depende de `currentPrice`

---

## Lógica de Negocio

### Cierre Automático

**Condición**:
```typescript
sum(entries[entryType='buy'].quantity) === sum(entries[entryType='sell'].quantity)
&& buyQty > 0
```

**Proceso**:
1. Se verifica después de cada `addEntry`
2. Si condición se cumple:
   - Status: `open` → `closed`
   - Calcula `balance` según `type`
   - Actualiza en transacción atómica
3. Una vez cerrada, no acepta más entradas

---

### Cálculo de Balance (Operaciones Cerradas)

**Operaciones Long**:
```
balance = totalVentas - totalCompras
```

Donde:
- `totalVentas` = Σ(sell.quantity × sell.price)
- `totalCompras` = Σ(buy.quantity × buy.price)

**Operaciones Short**:
```
balance = totalCompras - totalVentas
```

**Comisiones totales** (informativo, no afecta balance):
```
totalFees = Σ(entries.tax)
```

**Interpretación**:
- `balance > 0` → Ganancia
- `balance < 0` → Pérdida
- `balance = 0` → Break-even

---

### Cálculos en Tiempo Real (Operaciones Abiertas)

**Cantidad Actual**:
- Long:
```
currentQty = buyQty - sellQty
```
- Short:
```
currentQty = sellQty - buyQty
```

**Precio Promedio de Entrada** (weighted average):
- Long:
```
avgBuyPrice = Σ(buy.quantity × buy.price) / Σ(buy.quantity)
```
- Short:
```
avgBuyPrice = Σ(sell.quantity × sell.price) / Σ(sell.quantity)
```

**P&L No Realizado**:

Long:
```
unrealizedPnL = (currentPrice - avgBuyPrice) × currentQty
```

Short:
```
unrealizedPnL = (avgBuyPrice - currentPrice) × currentQty
```

Nota: `currentPrice` se obtiene del último registro en `price_history`. Si no existe, `unrealizedPnL = null`.

**Derivados (short/long)**:
Para `product = derivative`, el cálculo se trata como **long** independientemente del `type`,
porque el precio del derivado ya incorpora la inversión del subyacente.
Si las entradas están invertidas (más ventas que compras), se usa la
parte dominante para calcular el precio medio de entrada.

**Apalancamiento (Derivados)**:
- `leverage` opcional (float positivo, 2 decimales)
- `currentMargin = currentInvestment / leverage`
- `% P&L sobre margen = unrealizedPnL / currentMargin * 100`
- Para derivados, el precio ya incorpora el apalancamiento, por lo que
  `unrealizedPnL` y `balance` no se multiplican por `leverage`.
- El `% P&L` sobre exposición se calcula sin apalancamiento (movimiento real del precio).

---

## Restricciones y Validaciones

### A Nivel de Base de Datos

**Relaciones**:
- `operations.accountId` → Cascade delete
- `operations.symbolId` → No cascade
- `operation_entries.operationId` → Cascade delete
- `price_history.operationId` → Cascade delete

**Índices**:
- `operations`: userId, accountId, symbolId, status
- `operation_entries`: operationId
- `price_history`: operationId
- `symbols`: code (unique)

---

### A Nivel de Aplicación

**Autenticación/Autorización**:
- AuthGuard en todos los endpoints
- Filtrado automático por `userId`
- Usuario solo accede a sus propias operaciones

**Validaciones de Enums**:
- `product`: `crypto` | `stock` | `etf`
- `type`: `long` | `short`
- `entryType`: `buy` | `sell`
- `status`: `open` | `closed`

**Validaciones de Negocio**:
- No agregar entradas a operaciones cerradas
- `quantity` y `price` deben ser > 0
- `date` debe ser ISO 8601 válido
- `userId` requerido en creación

**Transacciones Atómicas**:
- `create` con `firstEntry`
- `addEntry` con posible cierre automático

---

## DTOs

### `CreateOperationDto`
```typescript
{
  accountId: string;
  symbolId: string;
  product: 'crypto' | 'stock' | 'etf' | 'derivative';
  type: 'long' | 'short';
  userId: string;  // asignado automáticamente
  leverage?: number;     // Opcional (solo derivados, máx 2 decimales)
  firstEntry?: CreateEntryDto;
}
```

### `CreateEntryDto`
```typescript
{
  entryType: 'buy' | 'sell';
  quantity: number;
  price: number;
  tax?: number;  // default: 0
  date: string;  // ISO 8601
}
```

### `CreatePriceHistoryDto`
```typescript
{
  price: number;
  date: string;  // ISO 8601
}
```

---

## Testing

**Archivo**: `operations.service.spec.ts`

**Cobertura**:
- ✅ Crear operación con entrada inicial
- ✅ Listar operaciones con filtros
- ✅ Obtener detalle con métricas
- ✅ Agregar entrada con cierre automático
- ✅ Eliminar entrada
- ✅ Agregar precio histórico
- ✅ Eliminar operación
- ✅ Validación de operaciones cerradas

---

## Frontend - Gráfico de precio e inversión
- **Fuente de datos**: `symbol.priceHistory` y `entries` en el detalle de operación.
- **Detalle de operación**: retorna `priceHistory` del último año (ordenado desc).
- **Precio**: serie de `priceHistory` ordenada por fecha.
- **Inversión neta**: acumulado de entradas/salidas (`buy` suma, `sell` resta).
- **Rango temporal**: filtro por periodos (7D, 1M, 3M, 6M, 1A, Todo).

## Scope de datos
- Todas las operaciones se filtran por **usuario y cuenta activa**.
- Los símbolos vinculados a operaciones son **privados por cuenta activa**.

## Backend - Entradas y precios
- Al crear una nueva entrada (`addEntry`) se registra también un precio en `price_history`
  con el mismo `price` y `date` de la entrada.

**Mocks**:
- PrismaService con transacciones
- Validación de cálculos de balance
- Validación de métricas en tiempo real
