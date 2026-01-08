# Tracking: Sistema de Operaciones de Trading

## Estado: En progreso

## Fases
- [x] Fase 1 - Backend base (schema, migracion, modulos)
- [x] Fase 2 - Logica de negocio (cierre automatico, calculos)
- [ ] Fase 3 - Frontend estructura (stores, rutas)
- [ ] Fase 4 - Frontend paginas (operations, symbols)
- [ ] Fase 5 - Integracion (navegacion, config)

## Tareas detalladas

### Fase 1: Backend base ✅
- [x] Actualizar schema.prisma con modelos symbols, operations, operation_entries, price_history
- [x] Ejecutar migracion Prisma
- [x] Crear modulo Symbols (module, service, controller, DTOs)
- [x] Crear tests unitarios para SymbolsService
- [x] Crear modulo Operations (module, service, controller, DTOs)
- [x] Crear tests unitarios para OperationsService
- [x] Registrar modulos en app.module.ts

### Fase 2: Logica de negocio ✅
- [x] Implementar createOperation con transaccion
- [x] Implementar addEntry + cierre automatico
- [x] Implementar calculos (avgPrice, currentQty, unrealizedPnL)
- [x] Implementar getOperationDetail con includes

### Fase 3: Frontend estructura
- [ ] Actualizar config.ts con diccionarios
- [ ] Crear OperationsStore.ts
- [ ] Crear SymbolsStore.ts
- [ ] Crear rutas frontend operations y symbols
- [ ] Registrar en router principal

### Fase 4: Frontend paginas
- [ ] OperationsPage.vue + componentes listado
- [ ] NewOperationPage.vue + SymbolSelector
- [ ] OperationDetailPage.vue + componentes detalle
- [ ] SymbolsPage.vue + SymbolFormPage.vue

### Fase 5: Integracion
- [ ] Actualizar MainLayout.vue con navegacion
- [ ] Cambiar home_page a 'operations' en config
- [ ] Validaciones y notificaciones

## Notas
- Creacion inline de simbolos desde formulario de operacion
- Simbolo = un producto (crypto o stock)
- Operaciones vinculadas a cuenta (account)
- Nueva seccion principal en navegacion