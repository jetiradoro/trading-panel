# Market Sync - Cron y actualizacion de precios

Documentacion tecnica del proceso automatico de actualizacion de precios.

## Flujo General

1. Cron diario ejecuta el proceso.
2. Se obtienen simbolos con operaciones abiertas y `marketCode` + `marketProvider`.
3. Se consulta el proveedor configurado.
4. Se inserta `price_history` si el precio/fecha no existe.
5. Se actualiza `marketSyncStatus`/`marketSyncError` en el simbolo.
6. Errores se registran en logs.

## Modelo de Datos

Tabla `symbols`:
- `marketCode` (String, nullable)
- `marketProvider` (String, nullable)
- `marketSyncStatus` (String, nullable) -> `ok` | `error`
- `marketSyncError` (String, nullable)

## Cron

Archivo: `api/src/market-data/market-sync.cron.ts`

- Se arranca en `api/src/app.module.ts` con `ScheduleModule.forRoot()`.
- Expresion actual (pruebas): `*/1 * * * *` (cada minuto)
- Zona horaria: `Europe/Madrid`

> Para produccion: cambiar a `0 21 * * *`.

## Servicio

Archivo: `api/src/symbols/symbols.service.ts`

Metodo:
- `syncOpenOperationsMarketPrices()`

Logica:
- Busca operaciones abiertas.
- Filtra simbolos con `marketCode` y `marketProvider`.
- Llama `priceMarketSync(symbolId)`.
- Si error, actualiza estado y registra en log.

## Endpoints relacionados

- `POST /symbols/:id/market-sync` (sync manual)
- `GET /market-data/providers` (lista proveedores configurados)

## Logs

Carpeta: `api/logs/`

- `cron_exec.log`: inicio y fin de cada ejecucion.
- `cron_scheduler_error.log`: fallos del cron.
- `market_sync_errors.log`: errores por simbolo.

Formato estandar:
```
[YYYY-MM-DD HH:mm:ss] ERROR symbolId=... symbolCode=... marketCode=... message="..."
```

## Validaciones

- `marketCode` y `marketProvider` son obligatorios para sincronizar.
- No se inserta historico si `price + date` ya existe.

## Permisos

- Cron y servicios ejecutan sin usuario.
- Endpoints de mercado requieren sesion valida.
