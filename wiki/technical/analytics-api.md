# Analítica - API (Documentación Técnica)

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Modelo de Datos](#modelo-de-datos)
- [Endpoints API](#endpoints-api)
- [Servicios](#servicios)
- [DTOs](#dtos)
- [Lógica de Negocio](#lógica-de-negocio)
- [Testing](#testing)

---

## Descripción General

Módulo de **Business Intelligence** que proporciona un dashboard de analítica con KPIs, gráficos y métricas de rendimiento de inversiones. Calcula todas las métricas en tiempo real sobre las tablas existentes sin necesidad de tablas adicionales.

**Scope**: Todos los endpoints operan **exclusivamente sobre la cuenta activa** del usuario autenticado.

**Características principales:**
- Balance de cuenta (total, invertido, disponible)
- Métricas de rendimiento (P&L realizado/no realizado, win rate)
- Ranking de símbolos por rendimiento
- Distribución de inversiones por tipo de producto
- Evolución temporal del portfolio
- Filtros de periodo (7d, 30d, 90d, 1 año, Todo)

---

## Modelo de Datos

**No requiere tablas adicionales**. Utiliza las siguientes tablas existentes:

### Tablas Utilizadas

1. **`transactions`**
   - Calcula el balance total (depósitos - retiros)
   - Índice: `(userId, accountId, date)`

2. **`operations`**
   - Calcula dinero invertido en operaciones abiertas
   - Calcula P&L realizado de operaciones cerradas
   - Índices: `(userId, status, accountId, updatedAt)`

3. **`operation_entries`**
   - Calcula precio promedio de compra/venta
   - Genera puntos para evolución del portfolio
   - Índices: `(operationId, entryType, date)`

4. **`price_history`**
   - Obtiene precio actual para calcular P&L no realizado
   - Genera datos para sparklines
   - Índice: `(symbolId, date DESC)`

### Índices Compuestos Añadidos

```prisma
@@index([userId, accountId, date], map: "idx_transactions_user_account_date")
@@index([userId, status, accountId, updatedAt], map: "idx_operations_analytics")
@@index([operationId, entryType, date], map: "idx_entries_analytics")
@@index([symbolId, date(sort: Desc)], map: "idx_price_history_symbol_date")
```

---

## Endpoints API

Todos los endpoints requieren autenticación (`AuthGuard`).

### 1. GET `/analytics/dashboard`

Obtiene todos los datos del dashboard en una sola llamada.

**Query Params:**
```typescript
{
  period?: '7d' | '1m' | '3m' | '6m' | '30d' | '90d' | '1y' | 'all';  // Default: '30d'
  product?: 'trading' | 'etf';                    // Opcional (filtra datos de analitica)
  accountId?: string;                             // Opcional
}
```

**Response:**
```typescript
{
  accountBalance: {
    totalFromTransactions: number;
    totalInvested: number;
    availableCash: number;
    investedTrading: number;
    investedEtf: number;
    openPnLTrading: number;
    openPnLEtf: number;
    totalOpenPnL: number;
    totalOpenValue: number;
  },
  performance: {
    realizedPnL: number;
    unrealizedPnL: number;
    totalPnL: number;
    totalPnLPercentage: number;
    winningOperations: number;
    losingOperations: number;
    winRate: number;
  },
  symbolsRanking: SymbolPerformanceDto[],
  productDistribution: ProductDistributionDto[],
  portfolioEvolution: PortfolioPointDto[],
  lastUpdated: string;
}
```

**Ejemplo:**
```bash
GET /analytics/dashboard?period=30d&product=trading
```

---

### 2. GET `/analytics/account-balance`

Calcula el balance de cuenta.

**Query Params:**
```typescript
{
  accountId?: string;  // Opcional
}
```

**Response:**
```typescript
{
  totalFromTransactions: number;  // Suma de transactions
  totalInvested: number;          // Dinero en operaciones abiertas (global)
  availableCash: number;          // total - invested
  investedTrading: number;        // Invertido solo en trading
  investedEtf: number;            // Invertido solo en planes ETF
  openPnLTrading: number;         // P&L abierto de trading
  openPnLEtf: number;             // P&L abierto de ETF
  totalOpenPnL: number;           // P&L abierto total
  totalOpenValue: number;         // Invertido total + P&L abierto total
}
```

**Lógica:**
- `totalFromTransactions` = SUM(transactions.amount) donde amount puede ser + o -
- `totalInvested` = Suma de (buy_quantity * buy_price - sell_quantity * sell_price) en operations abiertas
- `availableCash` = totalFromTransactions - totalInvested

**Ejemplo:**
```bash
GET /analytics/account-balance
```

Response:
```json
{
  "totalFromTransactions": 10000,
  "totalInvested": 6500,
  "availableCash": 3500,
  "investedTrading": 4200,
  "investedEtf": 2300,
  "openPnLTrading": 180,
  "openPnLEtf": -40,
  "totalOpenPnL": 140,
  "totalOpenValue": 6640
}
```

---

### 3. GET `/analytics/performance`

Calcula métricas de rendimiento global.

**Query Params:**
```typescript
{
  period?: '7d' | '1m' | '3m' | '6m' | '30d' | '90d' | '1y' | 'all';  // Default: '30d'
  product?: 'trading' | 'etf';                  // Opcional (separa ETF vs Trading)
  accountId?: string;
}
```

**Response:**
```typescript
{
  realizedPnL: number;          // De operaciones cerradas
  unrealizedPnL: number;        // De operaciones abiertas
  totalPnL: number;             // realizedPnL + unrealizedPnL
  totalPnLPercentage: number;   // % sobre inversión actual
  winningOperations: number;    // Operaciones con balance > 0
  losingOperations: number;     // Operaciones con balance < 0
  winRate: number;              // % de operaciones ganadoras
}
```

**Lógica P&L No Realizado:**

Para **operaciones LONG**:
```
unrealizedPnL = (currentPrice - avgBuyPrice) * currentQuantity
```

Para **operaciones SHORT**:
```
unrealizedPnL = (avgBuyPrice - currentPrice) * currentQuantity
```

**Ejemplo:**
```bash
GET /analytics/performance?period=30d&product=etf
```

Response:
```json
{
  "realizedPnL": 450.50,
  "unrealizedPnL": 120.30,
  "totalPnL": 570.80,
  "totalPnLPercentage": 8.78,
  "winningOperations": 12,
  "losingOperations": 3,
  "winRate": 80.00
}
```

---

### 4. GET `/analytics/symbols-ranking`

Ranking de símbolos ordenado por rendimiento total (P&L).

**Query Params:**
```typescript
{
  period?: '7d' | '1m' | '3m' | '6m' | '30d' | '90d' | '1y' | 'all';  // Default: '30d'
  product?: 'trading' | 'etf';                  // Opcional (separa ETF vs Trading)
  accountId?: string;
}
```

**Response:**
```typescript
SymbolPerformanceDto[] = [
  {
    symbolId: string;
    code: string;
    name: string;
    logo: string | null;
    product: 'crypto' | 'stock' | 'etf';
    totalInvested: number;
    realizedPnL: number;
    unrealizedPnL: number;
    totalPnL: number;
    pnlPercentage: number;
    operationsCount: number;
    sparklineData: number[];  // Últimos 30 precios
  }
]
```

**Ordenamiento:** Descendente por `totalPnL`.

**Ejemplo:**
```bash
GET /analytics/symbols-ranking?period=30d
```

Response:
```json
[
  {
    "symbolId": "sym-123",
    "code": "BTC",
    "name": "Bitcoin",
    "logo": "https://...",
    "product": "crypto",
    "totalInvested": 5000,
    "realizedPnL": 300,
    "unrealizedPnL": 150,
    "totalPnL": 450,
    "pnlPercentage": 9.0,
    "operationsCount": 3,
    "sparklineData": [45000, 46000, 47000, ...]
  }
]
```

---

### 5. GET `/analytics/product-distribution`

Distribución de inversiones por tipo de producto.

**Query Params:**
```typescript
{
  accountId?: string;
}
```

**Response:**
```typescript
ProductDistributionDto[] = [
  {
    product: 'crypto' | 'stock' | 'etf';
    label: string;              // "Criptos", "Acciones", "ETFs"
    totalInvested: number;
    percentage: number;
    operationsCount: number;
    pnl: number;                // Reservado para futuro uso
  }
]
```

**Ordenamiento:** Descendente por `totalInvested`.

**Ejemplo:**
```bash
GET /analytics/product-distribution
```

Response:
```json
[
  {
    "product": "crypto",
    "label": "Criptos",
    "totalInvested": 4000,
    "percentage": 61.54,
    "operationsCount": 5,
    "pnl": 0
  },
  {
    "product": "stock",
    "label": "Acciones",
    "totalInvested": 2500,
    "percentage": 38.46,
    "operationsCount": 3,
    "pnl": 0
  }
]
```

---

### 6. GET `/analytics/portfolio-evolution`

Evolución temporal del portfolio.

**Query Params:**
```typescript
{
  period?: '7d' | '1m' | '3m' | '6m' | '30d' | '90d' | '1y' | 'all';  // Default: '30d'
  accountId?: string;
}
```

**Response:**
```typescript
PortfolioPointDto[] = [
  {
    date: string;           // YYYY-MM-DD
    totalInvested: number;
    portfolioValue: number;
    pnl: number;
  }
]
```

**Intervalos según periodo:**
- `7d`: Puntos diarios
- `30d`: Puntos diarios
- `90d`: Puntos semanales
- `1y`, `all`: Puntos mensuales

**Ejemplo:**
```bash
GET /analytics/portfolio-evolution?period=1y&product=trading
```

Response:
```json
[
  {
    "date": "2026-01-03",
    "totalInvested": 5000,
    "portfolioValue": 5000,
    "pnl": 0
  },
  {
    "date": "2026-01-04",
    "totalInvested": 6000,
    "portfolioValue": 6000,
    "pnl": 0
  }
]
```

---

## Servicios

### AnalyticsService

**Métodos públicos:**

```typescript
class AnalyticsService {
  getDashboard(userId: string, period?: string, accountId?: string, product?: 'trading' | 'etf'): Promise<DashboardResponseDto>
  getAccountBalance(userId: string, accountId?: string): Promise<AccountBalanceDto>
  getPerformance(userId: string, period: string, accountId?: string, product?: 'trading' | 'etf'): Promise<PerformanceDto>
  getSymbolsRanking(userId: string, period: string, accountId?: string): Promise<SymbolPerformanceDto[]>
  getProductDistribution(userId: string, accountId?: string): Promise<ProductDistributionDto[]>
  getPortfolioEvolution(userId: string, period: string, accountId?: string, product?: 'trading' | 'etf'): Promise<PortfolioPointDto[]>
  getMonthlyPerformance(userId: string, accountId?: string, product?: 'trading' | 'etf'): Promise<MonthlyPerformanceDto[]>
  getEquityCurve(userId: string, period: string, accountId?: string, product?: 'trading' | 'etf'): Promise<EquityPointDto[]>
  getRiskMetrics(userId: string, period: string, accountId?: string, product?: 'trading' | 'etf'): Promise<RiskMetricsDto>
}

**Fecha de cierre de operaciones:**
- Para métricas que trabajan con operaciones cerradas (rendimiento mensual, curva de equity, métricas de riesgo),
  se usa la **fecha de la última entrada** como fecha de cierre real.
- Si una operación no tiene entradas, se usa `updatedAt` como fallback.
```

**Métodos privados:**

```typescript
private getDateFromPeriod(period: string): Date | null
```

Convierte periodo a fecha de inicio:
- `7d` → now - 7 días
- `30d` → now - 30 días
- `90d` → now - 90 días
- `1y` → now - 1 año
- `all` → null (sin filtro)

---

## DTOs

### AccountBalanceDto
```typescript
{
  totalFromTransactions: number;
  totalInvested: number;
  availableCash: number;
  investedTrading: number;
  investedEtf: number;
  openPnLTrading: number;
  openPnLEtf: number;
  totalOpenPnL: number;
  totalOpenValue: number;
}
```

### PerformanceDto
```typescript
{
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
  winningOperations: number;
  losingOperations: number;
  winRate: number;
}
```

### SymbolPerformanceDto
```typescript
{
  symbolId: string;
  code: string;
  name: string;
  logo: string | null;
  product: string;
  totalInvested: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  pnlPercentage: number;
  operationsCount: number;
  sparklineData: number[];
}
```

### ProductDistributionDto
```typescript
{
  product: string;
  label: string;
  totalInvested: number;
  percentage: number;
  operationsCount: number;
  pnl: number;
}
```

### PortfolioPointDto
```typescript
{
  date: string;
  totalInvested: number;
  portfolioValue: number;
  pnl: number;
}
```

### DashboardResponseDto
```typescript
{
  accountBalance: AccountBalanceDto;
  performance: PerformanceDto;
  symbolsRanking: SymbolPerformanceDto[];
  productDistribution: ProductDistributionDto[];
  portfolioEvolution: PortfolioPointDto[];
  lastUpdated: string;
}
```

---

## Lógica de Negocio

### Cálculo de Balance

**Total de Transacciones:**
```sql
SELECT SUM(amount) FROM transactions WHERE userId = ? [AND accountId = ?]
```

**Dinero Invertido:**
Para cada operación abierta:
```
invested = Σ(buy_entries.quantity * buy_entries.price)
         - Σ(sell_entries.quantity * sell_entries.price)
```

**Disponible:**
```
availableCash = totalFromTransactions - totalInvested
```

---

### Cálculo de P&L No Realizado

Para cada operación abierta:

1. **Obtener cantidad actual:**
   ```
   currentQty = Σ(buy_quantity) - Σ(sell_quantity)
   ```

2. **Calcular precio promedio de compra:**
   ```
   avgBuyPrice = Σ(buy_quantity * buy_price) / Σ(buy_quantity)
   ```

3. **Obtener precio actual del símbolo:**
   ```sql
   SELECT price FROM price_history
   WHERE symbolId = ?
   ORDER BY date DESC
   LIMIT 1
   ```

4. **Calcular P&L según tipo:**
   - **LONG:** `(currentPrice - avgBuyPrice) * currentQty`
   - **SHORT:** `(avgBuyPrice - currentPrice) * currentQty`

---

### Agrupación por Símbolo

Para ranking de símbolos:

1. Obtener todas las operaciones del usuario
2. Agrupar por `symbolId` usando Map
3. Para cada símbolo:
   - Sumar `realizedPnL` de operaciones cerradas
   - Calcular `unrealizedPnL` de operaciones abiertas
   - Obtener últimos 30 precios para sparkline
4. Ordenar por `totalPnL` descendente

---

## Testing

### Cobertura

**Tests unitarios:** 37 tests
- `AnalyticsService`: 13 tests
- `AnalyticsController`: 12 tests
- Frontend components: 12+ tests (E2E)

### Casos de Prueba

#### AnalyticsService

- ✅ Convierte periodos a fechas correctamente
- ✅ Calcula balance con transacciones positivas/negativas
- ✅ Calcula dinero invertido en operaciones abiertas
- ✅ Calcula P&L realizado de operaciones cerradas
- ✅ Calcula P&L no realizado (LONG y SHORT)
- ✅ Calcula win rate correctamente
- ✅ Filtra por periodo y accountId
- ✅ Agrupa símbolos y ordena por P&L
- ✅ Genera puntos de evolución con intervalos correctos

#### AnalyticsController

- ✅ Pasa parámetros correctos al servicio
- ✅ Usa periodo por defecto '30d'
- ✅ Maneja accountId opcional
- ✅ Retorna formato DTO correcto

---

## Errores Comunes

### 400 Bad Request
- Periodo inválido (usar: 7d, 30d, 90d, 1y, all)

### 401 Unauthorized
- Token no válido o expirado

### 404 Not Found
- AccountId no existe o no pertenece al usuario

### 500 Internal Server Error
- Error en cálculo de métricas
- Precio histórico no disponible para símbolo

---

## Optimización

**Índices críticos** para performance:
- `idx_transactions_user_account_date`
- `idx_operations_analytics`
- `idx_entries_analytics`
- `idx_price_history_symbol_date`

**Queries optimizadas:**
- Agregaciones con `aggregate()`
- Include selectivo con `orderBy` y `take`
- Filtrado temprano por `userId` y `accountId`

**Mejoras futuras:**
- Cache de resultados con TTL corto (ej: 30s)
- Tabla materializada para evolución histórica
- Cálculo de `portfolioValue` real (actualmente = `totalInvested`)
