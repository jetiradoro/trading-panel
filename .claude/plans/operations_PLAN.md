> NOTE: THIS FILE IS READONLY!!

# Plan: Sistema de Operaciones de Trading
Fecha: 2026-01-08

## Objetivo
Sistema para gestionar operaciones de compra/venta (long/short) con multiples entradas/salidas por operacion y seguimiento de precios historicos.

## Modelo de Datos

### Prisma Schema (nuevos modelos)

```prisma
model symbols {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  logo      String?
  product   String   // 'crypto' | 'stock'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  operations operations[]
}

model operations {
  id        String   @id @default(cuid())
  accountId String
  userId    String
  symbolId  String
  product   String   // 'crypto' | 'stock'
  type      String   // 'long' | 'short'
  status    String   @default("open") // 'open' | 'closed'
  balance   Float?   // null hasta cerrar
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  account  accounts          @relation(fields: [accountId], references: [id], onDelete: Cascade)
  symbol   symbols           @relation(fields: [symbolId], references: [id])
  entries  operation_entries[]
  prices   price_history[]

  @@index([userId])
  @@index([accountId])
  @@index([symbolId])
  @@index([status])
}

model operation_entries {
  id          String   @id @default(cuid())
  operationId String
  entryType   String   // 'buy' | 'sell'
  quantity    Float
  price       Float
  tax         Float    @default(0)
  date        DateTime
  createdAt   DateTime @default(now())

  operation operations @relation(fields: [operationId], references: [id], onDelete: Cascade)

  @@index([operationId])
}

model price_history {
  id          String   @id @default(cuid())
  operationId String
  price       Float
  date        DateTime
  createdAt   DateTime @default(now())

  operation operations @relation(fields: [operationId], references: [id], onDelete: Cascade)

  @@index([operationId])
}
```

**Modificar `accounts`**: anadir `operations operations[]`

## Fases

### Fase 1: Backend base
1. Actualizar `schema.prisma`
2. Ejecutar migracion: `npx prisma migrate dev --name add_operations`
3. Crear modulo `symbols` (module, service, controller, DTOs)
4. Crear modulo `operations` (module, service, controller, DTOs)
5. Registrar en `app.module.ts`

### Fase 2: Logica de negocio
1. Implementar `createOperation` con transaccion
2. Implementar `addEntry` + cierre automatico
3. Implementar calculos (avgPrice, currentQty, unrealizedPnL)
4. Implementar `getOperationDetail` con includes

### Fase 3: Frontend estructura
1. Actualizar `config.ts` con diccionarios
2. Crear `OperationsStore.ts`
3. Crear `SymbolsStore.ts`
4. Crear archivos de rutas
5. Registrar en router principal

### Fase 4: Frontend paginas
1. `OperationsPage.vue` + componentes listado
2. `NewOperationPage.vue` + SymbolSelector
3. `OperationDetailPage.vue` + componentes detalle
4. `SymbolsPage.vue` + `SymbolFormPage.vue`

### Fase 5: Integracion
1. Actualizar navegacion en `MainLayout.vue`
2. Cambiar `home_page` a 'operations' en config
3. Validaciones y notificaciones

## Archivos afectados

### Backend (crear)
- `api/src/symbols/symbols.module.ts`
- `api/src/symbols/symbols.service.ts`
- `api/src/symbols/symbols.controller.ts`
- `api/src/symbols/dtos/CreateSymbolDto.ts`
- `api/src/symbols/dtos/UpdateSymbolDto.ts`
- `api/src/operations/operations.module.ts`
- `api/src/operations/operations.service.ts`
- `api/src/operations/operations.controller.ts`
- `api/src/operations/dtos/CreateOperationDto.ts`
- `api/src/operations/dtos/CreateEntryDto.ts`
- `api/src/operations/dtos/CreatePriceHistoryDto.ts`

### Backend (modificar)
- `api/prisma/schema.prisma`
- `api/src/app.module.ts`

### Frontend (crear)
- `app/src/modules/operations/OperationsStore.ts`
- `app/src/modules/operations/routes.ts`
- `app/src/modules/operations/pages/OperationsPage.vue`
- `app/src/modules/operations/pages/OperationDetailPage.vue`
- `app/src/modules/operations/pages/NewOperationPage.vue`
- `app/src/modules/operations/components/OperationsList.vue`
- `app/src/modules/operations/components/OperationListItem.vue`
- `app/src/modules/operations/components/EntriesList.vue`
- `app/src/modules/operations/components/EntryForm.vue`
- `app/src/modules/operations/components/PriceHistoryList.vue`
- `app/src/modules/operations/components/PriceForm.vue`
- `app/src/modules/operations/components/SymbolSelector.vue`
- `app/src/modules/operations/components/OperationsFilters.vue`
- `app/src/modules/symbols/SymbolsStore.ts`
- `app/src/modules/symbols/routes.ts`
- `app/src/modules/symbols/pages/SymbolsPage.vue`
- `app/src/modules/symbols/pages/SymbolFormPage.vue`

### Frontend (modificar)
- `app/src/config.ts`
- `app/src/router/routes.ts`
- `app/src/layouts/MainLayout.vue`

## Endpoints API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/symbols` | Listar simbolos |
| GET | `/symbols/search?q=` | Buscar simbolos |
| POST | `/symbols` | Crear simbolo |
| PUT | `/symbols/:id` | Actualizar simbolo |
| DELETE | `/symbols/:id` | Eliminar simbolo |
| GET | `/operations` | Listar operaciones (filtros: status, product, symbol) |
| GET | `/operations/:id` | Detalle con entries, prices y calculos |
| POST | `/operations` | Crear operacion con primera entry |
| DELETE | `/operations/:id` | Eliminar operacion |
| POST | `/operations/:id/entries` | Anadir entry |
| DELETE | `/operations/:id/entries/:entryId` | Eliminar entry |
| POST | `/operations/:id/prices` | Anadir precio historico |

## Logica de negocio clave

1. **Cierre automatico**: cuando `sum(buy.qty) == sum(sell.qty)`
2. **Calculo balance al cerrar**:
   - Long: `sellTotal - buyTotal - taxes`
   - Short: `buyTotal - sellTotal - taxes`
3. **Calculos para operaciones abiertas**:
   - `currentQty`: buyQty - sellQty
   - `avgBuyPrice`: weighted average
   - `unrealizedPnL`: (currentPrice - avgPrice) * qty (long) o inverso (short)

## Config (diccionarios)

```typescript
products: [
  { code: 'crypto', label: 'Criptomoneda' },
  { code: 'stock', label: 'Accion' }
],
operationTypes: [
  { code: 'long', label: 'Long (Compra)' },
  { code: 'short', label: 'Short (Venta)' }
],
entryTypes: [
  { code: 'buy', label: 'Compra' },
  { code: 'sell', label: 'Venta' }
],
operationStatus: [
  { code: 'open', label: 'Abierta', color: 'green' },
  { code: 'closed', label: 'Cerrada', color: 'grey' }
]
```

## Verificacion

1. **Backend**: Probar endpoints con curl/Postman
2. **Frontend**: Navegar, crear operaciones, anadir entries
3. **Flujo completo**: Crear operacion long, anadir entries, cerrar con ventas