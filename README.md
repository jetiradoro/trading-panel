# Descripción

Proyecto de integración de datos de instancias ePolca y centro de monitorización.

# Entornos

## API

Desarrollada en node con el framework [Nest JS](https://docs.nestjs.com/)

# Instalación

1. Clonar el proyecto del repositorio
2. Copiar el archivo **docker/epolca-panel/.env.example** a **docker/epolca-panel/.env** y rellenar con los datos de tu entorno
3. Levantar proyecto

```bash
docker compose -f docker/epolca-panel/docker-compose.local.yml up -d
```

> para levantarlo en producción ejecutar `docker compose -f docker/epolca-panel/docker-compose.yml up -d`

4. Probar ruta raíz para ver si la api responde correctamente
