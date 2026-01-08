# Arquitectura del Proyecto

## Stack
- **BBDD**: MariaDB/MySQL + Prisma ORM
- **API**: NestJS (TypeScript) - `api/`
- **App**: Quasar/Vue 3 (TypeScript) - `app/`

## API (NestJS)
- Módulos: `auth`, `users`, `accounts`, `transactions`
- Schema: `api/prisma/schema.prisma`
- Auth: JWT + refresh tokens (cookies)

## App (Quasar/Vue 3)
- Estado: Pinia (`user`, `account`, `app`)
- Boot: `i18n`, `axios`, `pinia`, `auth`
- Rutas públicas: `/auth/*`
- Rutas protegidas: `/panel/*`, `/transactions/*`

## Estructura Módulos App
```
src/modules/{nombre}/
├── pages/
├── components/
├── routes.ts
```
