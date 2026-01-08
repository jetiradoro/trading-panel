# Operaciones de Trading

## Descripción General

Módulo para gestionar operaciones de trading (compra/venta de activos financieros). Permite crear operaciones long/short, registrar entradas (buy/sell), hacer seguimiento de precios históricos y consultar el estado de las operaciones.

**Fase actual**: Fase 1 - CRUD básico sin lógica de cierre automático.

## Backend

### Modelo de Datos

#### `operations`
Tabla principal de operaciones:
- `id` - Identificador único
- `accountId` - Cuenta asociada
- `userId` - Usuario propietario
- `symbolId` - Símbolo/activo (ej: BTC, AAPL)
- `product` - Tipo de producto: `crypto` | `stock`
- `type` - Tipo de operación: `long` | `short`
- `status` - Estado: `open` (por defecto)
- `balance` - Balance de la operación
- `createdAt`, `updatedAt` - Fechas de auditoría

#### `operation_entries`
Entradas de compra/venta dentro de una operación:
- `id` - Identificador único
- `operationId` - Operación a la que pertenece
- `entryType` - Tipo: `buy` | `sell`
- `quantity` - Cantidad de activos
- `price` - Precio unitario
- `tax` - Comisión/impuesto (default: 0)
- `date` - Fecha de la entrada
- `createdAt` - Fecha de creación

#### `price_history`
Histórico de precios de una operación:
- `id` - Identificador único
- `operationId` - Operación a la que pertenece
- `price` - Precio registrado
- `date` - Fecha del precio
- `createdAt` - Fecha de registro

### API Endpoints

**Base**: `/operations`
**Autenticación**: Requerida (AuthGuard)

#### `POST /operations`
Crear nueva operación con entrada inicial opcional.

**Body**:
```json
{
  "accountId": "string (requerido)",
  "symbolId": "string (requerido)",
  "product": "crypto | stock (requerido)",
  "type": "long | short (requerido)",
  "firstEntry": {
    "entryType": "buy | sell (requerido)",
    "quantity": "number (requerido)",
    "price": "number (requerido)",
    "tax": "number (opcional, default: 0)",
    "date": "ISO 8601 string (requerido)"
  }
}
```

**Respuesta**: Objeto `operation` creado

**Validaciones**:
- `userId` se asigna automáticamente del usuario autenticado
- `product` debe ser 'crypto' o 'stock'
- `type` debe ser 'long' o 'short'
- Si se incluye `firstEntry`, se validan sus campos

**Transacción**: Crea operación y primera entrada en una transacción atómica

---

#### `GET /operations`
Listar operaciones del usuario con filtros opcionales.

**Query params**:
- `status` (opcional) - Filtrar por estado
- `product` (opcional) - Filtrar por tipo de producto
- `symbolId` (opcional) - Filtrar por símbolo

**Respuesta**: Array de operaciones con relaciones `symbol` y `account`

**Ordenamiento**: Por `createdAt` descendente (más recientes primero)

**Filtrado automático**: Solo devuelve operaciones del usuario autenticado

---

#### `GET /operations/:id`
Obtener detalle completo de una operación.

**Params**:
- `id` - ID de la operación

**Respuesta**: Operación con relaciones:
- `symbol` - Datos del símbolo
- `account` - Datos de la cuenta
- `entries` - Array de entradas (ordenadas por fecha ascendente)
- `prices` - Array de precios históricos (ordenados por fecha descendente)

**Error**: 404 si no existe

---

#### `POST /operations/:id/entries`
Agregar entrada (buy/sell) a una operación existente.

**Params**:
- `id` - ID de la operación

**Body**:
```json
{
  "entryType": "buy | sell (requerido)",
  "quantity": "number (requerido)",
  "price": "number (requerido)",
  "tax": "number (opcional, default: 0)",
  "date": "ISO 8601 string (requerido)"
}
```

**Respuesta**: Objeto `operation_entry` creado

**Validaciones**:
- Operación debe existir
- `entryType` debe ser 'buy' o 'sell'
- `quantity` y `price` deben ser números positivos
- `date` debe ser formato ISO 8601 válido

**Nota**: Fase 1 no implementa lógica de cierre automático

---

#### `DELETE /operations/:id/entries/:entryId`
Eliminar una entrada de una operación.

**Params**:
- `id` - ID de la operación
- `entryId` - ID de la entrada

**Respuesta**: Objeto `operation_entry` eliminado

**Validaciones**:
- Entrada debe existir
- Entrada debe pertenecer a la operación especificada

**Error**: 404 si no existe o no coincide

---

#### `POST /operations/:id/prices`
Agregar precio histórico a una operación.

**Params**:
- `id` - ID de la operación

**Body**:
```json
{
  "price": "number (requerido)",
  "date": "ISO 8601 string (requerido)"
}
```

**Respuesta**: Objeto `price_history` creado

**Validaciones**:
- Operación debe existir
- `price` debe ser número positivo
- `date` debe ser formato ISO 8601 válido

---

#### `DELETE /operations/:id`
Eliminar una operación.

**Params**:
- `id` - ID de la operación

**Respuesta**: Objeto `operation` eliminado

**Cascada**: Elimina automáticamente todas las `entries` y `prices` asociadas

**Error**: 404 si no existe

---

### Servicios

**Clase**: `OperationsService`

**Métodos principales**:
- `create(data)` - Crear operación con entrada inicial opcional (transaccional)
- `findAll(filters)` - Listar operaciones con filtros
- `findOne(id)` - Obtener detalle completo con relaciones
- `addEntry(operationId, data)` - Agregar entrada
- `removeEntry(operationId, entryId)` - Eliminar entrada
- `addPrice(operationId, data)` - Agregar precio histórico
- `remove(id)` - Eliminar operación

**Dependencias**:
- `PrismaService` - Acceso a base de datos

---

## Restricciones y Validaciones

### A nivel de base de datos
- Relación con `accounts` con `onDelete: Cascade`
- Relación con `symbols` sin cascada
- Índices en: `userId`, `accountId`, `symbolId`, `status`
- Cascada en `operation_entries` y `price_history` al eliminar operación

### A nivel de aplicación
- Usuario autenticado automáticamente asignado a operaciones
- Validación de enums: `product` (crypto/stock), `type` (long/short), `entryType` (buy/sell)
- Validación de tipos numéricos positivos
- Validación de formato de fechas ISO 8601
- Verificación de existencia antes de operaciones relacionadas
- Transacciones atómicas para operaciones complejas

---

## Permisos

- **Autenticación**: Requerida para todos los endpoints (AuthGuard)
- **Autorización**: Usuario solo puede ver/modificar sus propias operaciones (filtrado automático por `userId`)

---

## Frontend

**Pendiente**: Documentar componentes Vue y flujos de usuario una vez implementados.

---

## Guía de Uso

### Crear operación nueva

1. Seleccionar cuenta y símbolo
2. Especificar tipo de producto (crypto/stock) y tipo de operación (long/short)
3. Opcionalmente agregar primera entrada con cantidad, precio y comisión
4. La operación se crea con estado "open"

### Agregar entradas

1. Acceder al detalle de la operación
2. Agregar entrada tipo "buy" o "sell"
3. Especificar cantidad, precio unitario, comisión y fecha
4. La entrada se registra sin cerrar automáticamente la operación (Fase 1)

### Seguimiento de precios

1. Registrar precios históricos manualmente
2. Los precios se muestran ordenados por fecha más reciente

### Eliminar operación

1. Solo eliminar operaciones sin dependencias críticas
2. Todas las entradas y precios se eliminan automáticamente

---

## Roadmap

**Fase 1** (Actual): CRUD básico sin cierre automático
**Fase 2** (Futura): Lógica de cierre automático cuando entradas buy/sell se balanceen
**Fase 3** (Futura): Cálculo automático de P&L (profit/loss)
**Fase 4** (Futura): Integración con APIs de precios en tiempo real
