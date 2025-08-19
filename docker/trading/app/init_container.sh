#!/bin/bash

# init_container.sh - Script de inicialización para el contenedor epolca-panel

set -e

# Aquí puedes agregar los comandos de inicialización necesarios
echo "Inicializando el contenedor trading-app..."


if [ ! -d "/app/node_modules" ]; then
    echo "/app/node_modules no existe, ejecutando npm install..."
    npm install
fi

if [ "$DOCKER_ENVIRONMENT" = "dev" ]; then
    quasar dev -p 80
else
    quasar build -m pwa
    quasar serve -p 443 /app/dist/pwa
fi