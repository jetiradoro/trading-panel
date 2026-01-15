# Autenticacion - API

## Objetivo
Gestiona sesiones con JWT (access token) y refresh token por cookie.

## Configuracion
- JWT_EXPIRATION (segundos). Default en codigo: 3600 (1h).
- Refresh token: 7 dias (cookie + BD).

## Endpoints
### POST /auth/login
Request:
```
{ "username": "email", "password": "..." }
```
Response:
```
{ "name": "...", "email": "...", "access_token": "..." }
```
Notas:
- Setea cookie httpOnly `refresh_token` con path `/auth/refresh`.

### POST /auth/refresh
Request:
- Cookie `refresh_token` (httpOnly).

Response:
```
{ "name": "...", "email": "...", "access_token": "..." }
```

## Validaciones y errores
- 401 si falta refresh token.
- 401 si refresh token es invalido o caducado.

## Datos en BD
- users.refresh_token
- users.token_expiration
