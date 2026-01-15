# Sesion y autenticacion

## Como funciona
- Inicias sesion con email y password.
- La app guarda el access token y la API emite una cookie segura de refresh.
- El access token dura 1 hora y se renueva automaticamente con el refresh token.
- El refresh token dura 7 dias.

## Que esperar
- Puedes dejar una pagina abierta sin errores por expiracion.
- Si pasan mas de 7 dias sin actividad, se pedira login otra vez.
