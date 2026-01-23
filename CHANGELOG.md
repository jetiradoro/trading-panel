# CHANGELOG

## v3.0.2 - 23/01/26

- Configuración del método para obtener precios de cryptos
- modificación de posiciones y tasas, de forma que no figure en la posición pero si en el cómputo de posiciones abiertas

---

## v3.0.1 - 21/01/26

- fecha de cierre con hora 23:00:00 para precios de stock y ETF en EODHD

---

## v3.0.0 - 20/01/26

- sync automático de precios (cron) con logging dedicado
- sync manual de precios desde detalle del símbolo
- proveedores de mercado por símbolo y selector UI
- manejo de errores del proveedor y estado de sync en símbolos

---

## v2.1.0 - 20/01/26

- sesiones multiples por usuario (refresh tokens por dispositivo)

---

## v2.0.3 - 19/01/26

- disponible incluye P&L realizado en el balance del dashboard
- historial de precios ordenado por fecha de precio y paginacion por defecto en 5

---

## v2.0.2 - 19/01/26

- nuevo rango 5A en graficos de evolucion (simbolos, operacion, portfolio)
- indicador de % de variacion con flecha y color por periodo en graficos de evolucion
- porcentaje separado para invertido y valor del portfolio
- soporte de periodo 5y en API de analitica
- assets versionados con hash en build de Quasar para evitar cache en deploy

---

## v2.0.1 - 17/01/26

- orderna grafico de rendimiento mensual
- arreglar modal de historico de precios para focus en precio
- ordenacion manual de simbolos con drag & drop (solo en vista Todos)
- colores para P&L e invertido en listado de operaciones
- enlaces internos entre dashboard, operaciones, transacciones y simbolos

---

## v2.0.0 - 15/01/26

- Refactorización de Backend para añadir seguridad de acceso a datos de usuario y cuenta correctos
- Redirección de login al panel
- Incremento de lifetime del token
- Pantalla de operaciones con información agrupada y buscador
- Gráfico de historico de precios en detalle de operación
- Listado de operaciones por mes
- Buscador y número de resultados en símbolos
- Detalle del símbolo con el histórico
- Histórico de precios del símbolo paginado
- Gráfico de evolución del precio del símbolo
- PL total y total de operaciones por símbolo en listado y detalle
- Modificación en el dashboard para separar ETF de Trading.
- Arreglar calculos de rendimiento, y equity para coger fecha correcta
- Modificación de la tabla de ranking
