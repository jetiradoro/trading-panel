# Símbolos - API

Documentación técnica del módulo de símbolos y su ordenación manual.

## Modelo de Datos

Tabla `symbols`:
- `sortOrder` (INT, NOT NULL, default 0): posición de orden global por cuenta.

Índices relevantes:
- `@@index([accountId, sortOrder])` para ordenar por cuenta de forma eficiente.

## Endpoints

### `GET /symbols`
Lista símbolos de la cuenta activa ordenados por `sortOrder` y `code`.

### `PUT /symbols/reorder`
Reordena símbolos de la cuenta activa.

**Request body**
```json
{
  "ids": ["symbolId1", "symbolId2", "symbolId3"]
}
```

**Validaciones**
- Todos los IDs deben pertenecer a la cuenta activa del usuario.
- La lista es global por cuenta (no depende del producto).

**Response**
```json
{
  "success": true
}
```

**Errores**
- `404` si algún símbolo no pertenece a la cuenta activa.

## Lógica de Negocio

- En alta de símbolo se asigna `sortOrder = max + 1`.
- En el reordenamiento se actualiza cada `sortOrder` según la posición enviada.

