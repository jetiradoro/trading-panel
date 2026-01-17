# Navegacion Interna - UI

Documentacion tecnica de enlaces internos entre secciones.

## Flujo

- Dashboard:
  - Balance Total -> listado de transacciones.
  - Invertido Trading -> listado de operaciones.
  - Ranking de simbolos -> detalle del simbolo.
- Detalle de operacion:
  - Logo/nombre del simbolo -> detalle del simbolo.
  - Precio actual -> detalle del simbolo.

## Backend

- Sin cambios en API ni base de datos.

## Frontend

Componentes modificados:
- `AccountBalanceCards.vue` y `OpenInvestmentSummary.vue`: enlaces en KPI.
- `KpiCard.vue`: soporte de `linkTo`, borde destacado y cursor.
- `SymbolRankingItem.vue`: fila linkeable al detalle del simbolo.
- `OperationDetailPage.vue`: enlaces al detalle de simbolo.

## Validaciones

- Links solo funcionan si el simbolo existe en el estado actual.
- Los botones internos (info / add) no disparan navegacion.

## Permisos

- Navegacion dentro de rutas protegidas (`/panel`, `/transactions`, `/operations`, `/symbols`).
- Requiere sesion activa.

