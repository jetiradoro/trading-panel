# Operaciones de Trading

## Descripción General

Módulo para gestionar operaciones de trading (compra/venta de activos financieros). Permite crear operaciones long/short, registrar entradas (buy/sell), hacer seguimiento de precios históricos y consultar el estado de las operaciones. Incluye cierre automático de operaciones y cálculos de P&L.

**Fase actual**: Fase 2 - Lógica de negocio con cierre automático y cálculos implementados.

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
Obtener detalle completo de una operación con cálculos en tiempo real.

**Params**:
- `id` - ID de la operación

**Respuesta**: Operación con relaciones:
- `symbol` - Datos del símbolo
- `account` - Datos de la cuenta
- `entries` - Array de entradas (ordenadas por fecha ascendente)
- `prices` - Solo el último precio registrado (ordenado por fecha descendente, take: 1)
- `metrics` - (Solo si status='open') Objeto con cálculos en tiempo real:
  - `currentQty` - Cantidad actual en posesión (buyQty - sellQty)
  - `avgBuyPrice` - Precio promedio ponderado de compra
  - `buyQty` - Cantidad total comprada
  - `sellQty` - Cantidad total vendida
  - `unrealizedPnL` - P&L no realizado basado en último precio (null si no hay precio)

**Error**: 404 si no existe

**Nota**: Para operaciones cerradas (status='closed'), se devuelve el `balance` final sin métricas.

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
- Operación debe estar abierta (status='open'), no se pueden agregar entradas a operaciones cerradas
- `entryType` debe ser 'buy' o 'sell'
- `quantity` y `price` deben ser números positivos
- `date` debe ser formato ISO 8601 válido

**Cierre automático**: Si después de agregar la entrada se cumple que sum(buy.qty) == sum(sell.qty), la operación se cierra automáticamente:
- Se actualiza `status` a 'closed'
- Se calcula y guarda el `balance`:
  - **Long**: sellTotal - buyTotal - totalTaxes
  - **Short**: buyTotal - sellTotal - totalTaxes

**Transacción**: La creación de entrada y el posible cierre se realizan en una transacción atómica

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

**Métodos públicos**:
- `create(data)` - Crear operación con entrada inicial opcional (transaccional)
- `findAll(filters)` - Listar operaciones con filtros
- `findOne(id)` - Obtener detalle completo con relaciones y cálculos
- `addEntry(operationId, data)` - Agregar entrada con cierre automático
- `removeEntry(operationId, entryId)` - Eliminar entrada
- `addPrice(operationId, data)` - Agregar precio histórico
- `remove(id)` - Eliminar operación

**Métodos privados (lógica de negocio)**:
- `shouldCloseOperation(operationId, tx)` - Determina si una operación debe cerrarse
- `calculateBalance(operationId, operationType, tx)` - Calcula balance de operación cerrada
- `calculateMetrics(operation, currentPrice?)` - Calcula métricas para operaciones abiertas

**Dependencias**:
- `PrismaService` - Acceso a base de datos

**Características**:
- Uso de transacciones para operaciones críticas
- Cálculos automáticos de P&L
- Cierre automático de operaciones balanceadas

---

## Lógica de Negocio

### Cierre Automático de Operaciones

Una operación se cierra automáticamente cuando se cumple la condición:
```
sum(entries[entryType='buy'].quantity) == sum(entries[entryType='sell'].quantity)
```

**Proceso de cierre**:
1. Se verifica después de agregar cada nueva entrada
2. Si las cantidades se balancean:
   - Se actualiza `status` de 'open' a 'closed'
   - Se calcula el `balance` según el tipo de operación
   - Se guarda en una transacción atómica
3. Una vez cerrada, no se pueden agregar más entradas

### Cálculo de Balance (Operaciones Cerradas)

**Operaciones Long (Compra)**:
```
balance = totalVentas - totalCompras - comisiónTotal
```
Donde:
- `totalVentas` = sum(sell.quantity × sell.price)
- `totalCompras` = sum(buy.quantity × buy.price)
- `comisiónTotal` = sum(entries.tax)

**Operaciones Short (Venta)**:
```
balance = totalCompras - totalVentas - comisiónTotal
```

**Interpretación**:
- Balance > 0: Ganancia
- Balance < 0: Pérdida
- Balance = 0: Sin ganancia ni pérdida (break-even)

### Cálculos en Tiempo Real (Operaciones Abiertas)

Para operaciones con status='open', se calculan métricas en tiempo real:

**Cantidad Actual**:
```
currentQty = buyQty - sellQty
```

**Precio Promedio de Compra**:
```
avgBuyPrice = sum(buy.quantity × buy.price) / sum(buy.quantity)
```

**P&L No Realizado (Unrealized PnL)**:

Para **Long**:
```
unrealizedPnL = (currentPrice - avgBuyPrice) × currentQty
```

Para **Short**:
```
unrealizedPnL = (avgBuyPrice - currentPrice) × currentQty
```

**Nota**: `currentPrice` se obtiene del último precio registrado en `price_history`. Si no hay precios, `unrealizedPnL` será `null`.

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

1. Acceder al detalle de la operación (debe estar abierta)
2. Agregar entrada tipo "buy" o "sell"
3. Especificar cantidad, precio unitario, comisión y fecha
4. La entrada se registra y se verifica automáticamente si debe cerrarse la operación
5. **Cierre automático**: Si las cantidades compradas y vendidas se balancean, la operación:
   - Cambia a status='closed'
   - Se calcula el balance según el tipo de operación
   - No se pueden agregar más entradas

### Seguimiento de precios

1. Registrar precios históricos manualmente
2. Los precios se muestran ordenados por fecha más reciente

### Eliminar operación

1. Solo eliminar operaciones sin dependencias críticas
2. Todas las entradas y precios se eliminan automáticamente

---

## Roadmap

**Fase 1** ✅ (Completada): CRUD básico de operaciones, entradas y precios
- Schema de base de datos con 4 tablas (symbols, operations, operation_entries, price_history)
- Módulos backend completos (Symbols, Operations)
- Endpoints REST API funcionales
- Tests unitarios del servicio

**Fase 2** ✅ (Completada): Lógica de negocio con cierre automático y cálculos
- Cierre automático cuando sum(buy.qty) == sum(sell.qty)
- Cálculo de balance para operaciones cerradas
- Cálculos en tiempo real para operaciones abiertas (avgPrice, currentQty, unrealizedPnL)
- Transacciones atómicas para operaciones críticas
- Validación de estado (no agregar entradas a operaciones cerradas)

**Fase 3** (Pendiente): Frontend estructura
- Stores de Pinia para Operations y Symbols
- Rutas y navegación
- Configuración de diccionarios

**Fase 4** (Pendiente): Frontend páginas y componentes
- Listado de operaciones con filtros
- Detalle de operación con métricas
- Formularios de creación y edición
- Gestión de símbolos

**Fase 5** (Pendiente): Integración final
- Navegación en MainLayout
- Configuración de home_page
- Validaciones y notificaciones
- Documentación de frontend en wiki

**Futuras mejoras**:
- Integración con APIs de precios en tiempo real
- Gráficos de P&L histórico
- Alertas y notificaciones
- Exportación de datos a CSV/Excel

---

## Ejemplos Prácticos

### Ejemplo 1: Operación Long con Ganancia

**Operación**: Comprar 1 BTC, venderlo después a mejor precio

1. **Crear operación** (type='long'):
   - Primera entrada: buy 1 BTC a $50,000 (tax: $50)

2. **Estado**: open
   - currentQty: 1 BTC
   - avgBuyPrice: $50,000
   - Si hay precio actual $52,000:
     - unrealizedPnL = ($52,000 - $50,000) × 1 = $2,000

3. **Agregar entrada de venta**: sell 1 BTC a $52,000 (tax: $50)
   - Se verifica: buyQty (1) == sellQty (1) → **Se cierra automáticamente**
   - balance = $52,000 - $50,000 - $100 = **$1,900 ganancia**

### Ejemplo 2: Operación Long con Pérdida

1. **Crear operación** (type='long'):
   - Primera entrada: buy 2 AAPL a $150 (tax: $2)

2. **Estado**: open
   - currentQty: 2 acciones
   - avgBuyPrice: $150

3. **Agregar entrada de venta**: sell 2 AAPL a $140 (tax: $2)
   - Se cierra automáticamente
   - balance = $280 - $300 - $4 = **-$24 pérdida**

### Ejemplo 3: Operación con Múltiples Entradas

1. **Crear operación** (type='long'):
   - Primera entrada: buy 1 BTC a $50,000 (tax: $50)

2. **Agregar compra**: buy 1 BTC a $48,000 (tax: $50)
   - currentQty: 2 BTC
   - avgBuyPrice = ($50,000 + $48,000) / 2 = $49,000

3. **Venta parcial**: sell 1 BTC a $51,000 (tax: $50)
   - currentQty: 1 BTC (no se cierra aún)

4. **Venta final**: sell 1 BTC a $52,000 (tax: $50)
   - Se cierra automáticamente
   - totalCompras: $98,000
   - totalVentas: $103,000
   - balance = $103,000 - $98,000 - $200 = **$4,800 ganancia**

### Ejemplo 4: Operación Short

**Operación**: Vender primero (short) y comprar después a menor precio

1. **Crear operación** (type='short'):
   - Primera entrada: sell 1 BTC a $50,000 (tax: $50)

2. **Estado**: open
   - currentQty: -1 BTC (posición corta)

3. **Comprar para cerrar**: buy 1 BTC a $48,000 (tax: $50)
   - Se cierra automáticamente
   - balance = $50,000 - $48,000 - $100 = **$1,900 ganancia**
   - En short: vendiste caro ($50k) y compraste barato ($48k)
