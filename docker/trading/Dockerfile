FROM node:lts

# Instala NestJS CLI, Less y vi globalmente
RUN npm install -g @nestjs/cli less && \
    npm install -g @quasar/cli && \
    apt-get update && \
    apt-get install -y vim && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

