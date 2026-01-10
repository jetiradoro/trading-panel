# Plan: Analítica Avanzada + Info Tooltips

## Fase 1: Backend - Análisis Mensual ✅
- [x] Actualizar DTOs (MonthlyPerformanceDto)
- [x] Implementar getMonthlyPerformance()
- [x] Integrar en getDashboard()

## Fase 2: Backend - Curva de Equity ✅
- [x] Actualizar DTOs (EquityPointDto)
- [x] Implementar getEquityCurve()
- [x] Integrar en getDashboard()

## Fase 3: Backend - Métricas de Riesgo ✅
- [x] Actualizar DTOs (RiskMetricsDto)
- [x] Implementar getRiskMetrics()
- [x] Integrar en getDashboard()

## Fase 4: Frontend - Componente Modal Info
- [x] Crear InfoModal.vue reutilizable
- [x] Añadir icono info en AccountBalanceCards
- [x] Añadir icono info en PerformanceSummary
- [x] Añadir icono info en PortfolioEvolutionChart
- [x] Añadir icono info en ProductDistributionChart
- [x] Añadir icono info en SymbolRankingTable

## Fase 5: Frontend - Nuevos Componentes ✅
- [x] MonthlyPerformanceChart.vue
- [x] EquityCurveChart.vue
- [x] RiskMetricsCards.vue

## Fase 6: Integración ✅
- [x] Actualizar types.ts frontend
- [x] Actualizar AnalyticsStore
- [x] Integrar en DashboardPage

## Progreso Actual
**Fase actual:** Completado
**Estado:** Todos los componentes implementados e integrados

## Resumen de Implementación

### Backend (Completado)
- ✅ Análisis mensual de rendimiento
- ✅ Curva de equity con drawdown
- ✅ Métricas de riesgo avanzadas (Sharpe, Profit Factor, etc.)
- ✅ Integración en endpoint /analytics/dashboard

### Frontend (Completado)
- ✅ InfoModal reutilizable con tooltips informativos
- ✅ Iconos info en todos los widgets existentes
- ✅ MonthlyPerformanceChart - Gráfico de barras apiladas
- ✅ EquityCurveChart - Gráfico de líneas con doble eje Y
- ✅ RiskMetricsCards - 6 tarjetas KPI con métricas de riesgo
- ✅ AnalyticsStore actualizado con nuevas métricas
- ✅ DashboardPage con todos los componentes integrados

## Próximos Pasos
1. Probar el dashboard completo en navegador
2. Verificar que el backend responde correctamente
3. Ajustar estilos si es necesario
4. Documentar en wiki/ el funcionamiento completo
