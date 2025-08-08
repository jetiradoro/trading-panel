# Descripción

Aplicación en 3 capas

1. BBDD
2. App Quasar
3. Api Nest

## Definición

Este proyecto está orientado a la gestión y seguimiento de inversiones financieras realizadas a través de diferentes brokers. Permite centralizar la información de las operaciones, analizar el rendimiento y facilitar la toma de decisiones sobre las inversiones.

# Entornos

## API

Desarrollada en node con el framework [Nest JS](https://docs.nestjs.com/)

# Instalación

1. Clonar el proyecto del repositorio
2. Copiar el archivo **docker/trading/.env.example** a **docker/trading/.env** y rellenar con los datos de tu entorno
3. Levantar proyecto

```bash
docker compose -f docker/trading/docker-composeocal.yml up -d
```

4. Probar ruta raíz para ver si la api responde correctamente
