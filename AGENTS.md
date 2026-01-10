# AGENTS.md

## Contexto del proyecto
- Aplicacion de gestion de inversiones financieras (trading).
- Stack: MariaDB/MySQL + Prisma, NestJS (api/), Quasar/Vue 3 (app/).

## Comportamiento
- Nunca editar directamente el código. siempre mostrar cambios y solicitar validación.
- Para los estilos visuales del frontend usar siempre que sea posible las clases predefinidas de Quasar y utilizar solo estilos custom cuando sea necesario. 
- Usa razonamiento como experto en Ux/Ui y diseño de interfaces para crear y distribuir la información en el frontend para garantizar la mejor experiencia de usuario
- Al terminar cualquier modificación del frontend debes verificar que no haya fallos de vue ni de eslint

## Documentacion clave
- `CLAUDE.md` y `.claude/` contienen reglas de trabajo y arquitectura.
- Documentacion funcional en `wiki/` (manual tecnico y de usuario).
- Todo evolutivo debe documentarse en `wiki/` (flujo, backend, frontend, validaciones, permisos, guia de uso).

## Arquitectura y estructura
- API NestJS: modulos `auth`, `users`, `accounts`, `transactions`.
- Auth: JWT + refresh tokens por cookies.
- App Quasar/Vue: Pinia (`user`, `account`, `app`), boots `i18n`, `axios`, `pinia`, `auth`.
- Rutas publicas: `/auth/*`; rutas protegidas: `/panel/*`, `/transactions/*`.
- Modulos app: `src/modules/{nombre}/` con `pages/`, `components/`, `routes.ts`.

## Directrices de codigo
- SOLID y funciones de proposito unico.
- Nombres descriptivos.
- Documentacion obligatoria: cabeceras en clases/metodos + comentarios en codigo complejo.
- Resumenes concisos, sin explicaciones exhaustivas; eficiencia de tokens.

## Vue/Quasar
- Componentes pequenos (150-200 lineas max) y reutilizables.
- Extraer logica repetida a composables.
- Reutilizar componentes de `src/components/`.
- Mantener cohesion visual UX/UI.

## Comandos utiles
### API
- `npm run start:dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npx prisma migrate dev`
- `npx prisma generate`

### App
- `npm run dev`
- `npm run build`
- `npm run lint`

### Docker
- `docker compose -f docker/trading/docker-compose.yml up -d`

## Configuracion
- Copiar `.env.example` a `.env` en `docker/trading/` y `api/`.
