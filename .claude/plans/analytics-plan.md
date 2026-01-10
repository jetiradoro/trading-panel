# Plan: Módulo de Analítica / Business Intelligence

## Objetivo

Crear un dashboard de analítica financiera que reemplace la página de inicio actual (`IndexPage.vue`) con un panel de KPIs y gráficos para visualizar el rendimiento de inversiones.

## Directrices de Desarrollo

- **Optimización de tokens**: Resúmenes mínimos al final de cada fase (3-5 bullets máximo)
- **Backend**: Incluir tests unitarios para cada servicio/endpoint (el usuario los ejecutará en local)
- **Frontend**: Validar sintaxis Vue y ESLint antes de dar por completada cualquier pantalla
- **Sin explicaciones extensas**: Solo lo esencial para documentar el trabajo realizado

## Decisiones de Diseño

- **Ubicación**: Dashboard principal (reemplaza IndexPage)
- **Librería de gráficos**: ApexCharts (vue3-apexcharts)
- **Periodo por defecto**: Últimos 30 días
- **Filtros de periodo**: 7d, 30d, 90d, 1 año, Todo
- **Estrategia de datos**: Cálculo en tiempo real (queries agregadas sobre tablas existentes, sin tablas adicionales)

---

## Layout del Dashboard

```
+------------------------------------------------------------------+
|  [Filtro: 7d | 30d | 90d | 1a | Todo]                [Actualizar] |
+------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+ |
|  |  BALANCE TOTAL   |  | DINERO INVERTIDO |  |    DISPONIBLE    | |
|  |   12,450.00 EUR  |  |   8,200.00 EUR   |  |   4,250.00 EUR   | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
|  +----------------------------------------+  +------------------+ |
|  |     EVOLUCIÓN DEL PORTFOLIO            |  |   RENDIMIENTO    | |
|  |     (Gráfico Area: Invertido vs Valor) |  |    GLOBAL        | |
|  |                                        |  |  +1,245.50 EUR   | |
|  +----------------------------------------+  |  +10.5%          | |
|                                              |  Win: 12 (75%)   | |
|  +----------------------------------------+  +------------------+ |
|  |   DISTRIBUCIÓN POR PRODUCTO (Donut)    |                      |
|  +----------------------------------------+                      |
+------------------------------------------------------------------+
|              RANKING DE SÍMBOLOS (Top 10)                        |
|  # | Símbolo | Invertido | P&L      |   %    | Tendencia        |
|  1 | BTC     | 3,500     | +450.00  | +12.8% | [sparkline]      |
|  2 | ETH     | 2,100     | +180.00  |  +8.5% | [sparkline]      |
+------------------------------------------------------------------+
```

---

## Estructura de Archivos

### Backend (api/src/analytics/)

```
api/src/analytics/
├── analytics.module.ts
├── analytics.controller.ts
├── analytics.service.ts
├── analytics.service.spec.ts      # Tests
├── analytics.controller.spec.ts   # Tests
└── dto/
    ├── dashboard.dto.ts
    ├── account-balance.dto.ts
    ├── performance.dto.ts
    ├── symbol-performance.dto.ts
    └── portfolio-evolution.dto.ts
```

### Frontend (app/src/modules/analytics/)

```
app/src/modules/analytics/
├── pages/
│   └── DashboardPage.vue
├── components/
│   ├── KpiCard.vue
│   ├── AccountBalanceCards.vue
│   ├── PerformanceSummary.vue
│   ├── PortfolioEvolutionChart.vue
│   ├── ProductDistributionChart.vue
│   ├── SymbolRankingTable.vue
│   ├── SymbolRankingItem.vue
│   ├── SparklineChart.vue
│   └── PeriodFilter.vue
├── composables/
│   └── useAnalytics.ts
├── AnalyticsStore.ts
└── routes.ts
```

---

## Endpoints API

| Endpoint | Descripción |
|----------|-------------|
| `GET /analytics/dashboard?period=30d` | Datos completos del dashboard |
| `GET /analytics/account-balance` | Balance: total, invertido, disponible |
| `GET /analytics/performance?period=30d` | P&L realizado + no realizado, win rate |
| `GET /analytics/symbols-ranking?period=30d` | Lista ordenada por rendimiento |
| `GET /analytics/portfolio-evolution?period=30d` | Puntos para gráfico temporal |
| `GET /analytics/product-distribution` | Distribución crypto/stock/etf |

---

## DTOs Principales

```typescript
interface DashboardResponseDto {
  accountBalance: {
    totalFromTransactions: number;
    totalInvested: number;
    availableCash: number;
  };
  performance: {
    realizedPnL: number;
    unrealizedPnL: number;
    totalPnL: number;
    totalPnLPercentage: number;
    winningOperations: number;
    losingOperations: number;
    winRate: number;
  };
  symbolsRanking: SymbolPerformanceDto[];
  productDistribution: ProductDistributionDto[];
  portfolioEvolution: PortfolioPointDto[];
}
```

---

## Paleta de Colores

| Estado | Color | Uso |
|--------|-------|-----|
| Positivo | `#21BA45` | Ganancias |
| Negativo | `#C10015` | Pérdidas |
| Crypto | `#F7931A` | Naranja |
| Stock | `#1976D2` | Azul |
| ETF | `#388E3C` | Verde |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `app/src/pages/IndexPage.vue` | Reemplazar/eliminar |
| `app/src/layouts/MainLayout.vue` | Añadir enlace Dashboard |
| `api/prisma/schema.prisma` | Añadir índices |
| `app/quasar.config.js` | Registrar ApexCharts |
| `api/src/app.module.ts` | Importar AnalyticsModule |

---

## Verificación Final

1. Backend: Tests pasando
2. Frontend: Sin errores Vue/ESLint
3. Gráficos: ApexCharts renderiza correctamente
4. Filtros: Cambio de periodo funcional
5. Responsive: Layout móvil correcto
6. Cálculos: `invertido + disponible = total`
