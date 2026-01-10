# Tracking: Módulo de Analítica

## Estado General: ⏳ En progreso (Fases 1-4 completadas)

---

## Fases

### Fase 1: Infraestructura Base
**Estado**: ✅ Completada

- [x] Instalar ApexCharts (`npm install vue3-apexcharts apexcharts`)
- [x] Crear boot file `app/src/boot/apexcharts.ts`
- [x] Registrar boot en `quasar.config.js`
- [x] Crear módulo backend `api/src/analytics/`
- [x] Añadir índices en `schema.prisma`
- [x] Ejecutar migración Prisma
- [x] Tests backend: ✅

**Resumen**:
- ApexCharts instalado y configurado en boot file
- Backend: módulo analytics con controller, service y DTOs
- Índices compuestos añadidos para optimizar queries (transactions, operations, operation_entries, price_history)
- Tests unitarios: 25 tests pasando ✅ (13 service + 12 controller)
- AnalyticsModule registrado en app.module.ts

---

### Fase 2: Balance de Cuenta
**Estado**: ✅ Completada

- [x] Endpoint `GET /analytics/account-balance`
- [x] Test endpoint account-balance
- [x] Componente `KpiCard.vue`
- [x] Componente `AccountBalanceCards.vue`
- [x] Estructura básica `DashboardPage.vue`
- [x] Validar ESLint/Vue

**Resumen**:
- Endpoint `/analytics/account-balance` ya implementado desde Fase 1
- Tests controller: ✅ pasando
- Componente `KpiCard.vue`: reutilizable, soporte currency/percentage/number
- Componente `AccountBalanceCards.vue`: muestra 3 tarjetas (total/invertido/disponible)
- `DashboardPage.vue`: estructura básica con skeletons de carga
- ESLint: ✅ sin errores

---

### Fase 3: Rendimiento Global
**Estado**: ✅ Completada

- [x] Endpoint `GET /analytics/performance`
- [x] Test endpoint performance
- [x] Componente `PerformanceSummary.vue`
- [x] Integrar en dashboard
- [x] Validar ESLint/Vue

**Resumen**:
- Endpoint `/analytics/performance` ya implementado desde Fase 1
- Tests controller: ✅ 2 tests pasando (retorna métricas + periodo default)
- Archivo `types.ts` creado con interfaces TypeScript
- Componente `PerformanceSummary.vue`: muestra P&L total, realizado, no realizado, win rate con barra de progreso
- Integrado en `DashboardPage.vue` en grid responsive (col-4 en desktop)
- ESLint: ✅ sin errores

---

### Fase 4: Ranking de Símbolos
**Estado**: ✅ Completada

- [x] Endpoint `GET /analytics/symbols-ranking`
- [x] Test endpoint symbols-ranking
- [x] Componente `SymbolRankingTable.vue`
- [x] Componente `SymbolRankingItem.vue`
- [x] Componente `SparklineChart.vue`
- [x] Validar ESLint/Vue

**Resumen**:
- Endpoint `/analytics/symbols-ranking` ya implementado desde Fase 1
- Tests controller: ✅ 2 tests pasando (retorna ranking + periodo default)
- Componente `SparklineChart.vue`: mini gráfico de tendencia usando ApexCharts en modo sparkline
- Componente `SymbolRankingItem.vue`: fila del ranking con logo, nombre, invertido, P&L, %, sparkline
- Componente `SymbolRankingTable.vue`: tabla con cabecera, top N símbolos, estado vacío
- Integrado en `DashboardPage.vue` con skeleton de carga
- ESLint: ✅ sin errores

---

### Fase 5: Gráficos
**Estado**: ⏳ Pendiente

- [ ] Endpoint `GET /analytics/portfolio-evolution`
- [ ] Endpoint `GET /analytics/product-distribution`
- [ ] Tests endpoints
- [ ] Componente `PortfolioEvolutionChart.vue`
- [ ] Componente `ProductDistributionChart.vue`
- [ ] Validar ESLint/Vue

**Resumen**:
<!-- Completar al finalizar fase -->

---

### Fase 6: Filtros y Navegación
**Estado**: ⏳ Pendiente

- [ ] Componente `PeriodFilter.vue`
- [ ] Store `AnalyticsStore.ts`
- [ ] Configurar rutas
- [ ] Añadir enlace Dashboard en `MainLayout.vue`
- [ ] Validar ESLint/Vue

**Resumen**:
<!-- Completar al finalizar fase -->

---

### Fase 7: Pulido Final
**Estado**: ⏳ Pendiente

- [ ] Estados de carga (skeletons)
- [ ] Responsive mobile
- [ ] Manejo de errores
- [ ] Documentación en `wiki/`

**Resumen**:
<!-- Completar al finalizar fase -->

---

## Notas
<!-- Añadir notas relevantes durante el desarrollo -->
