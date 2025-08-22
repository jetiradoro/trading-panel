#!/bin/bash

# init_container.sh - Script de inicialización para el contenedor epolca-panel

set -e

# Aquí puedes agregar los comandos de inicialización necesarios
echo "Inicializando el contenedor trading-api..."


if [ ! -d "/app/node_modules" ]; then
    echo "/app/node_modules no existe, ejecutando npm install..."
    npm install
fi

npx prisma migrate deploy
npx prisma generate

if [ "$DOCKER_ENVIRONMENT" = "dev" ]; then
    npm run start:dev
else
    npm run start
fi
exit 0
npm run start:dev