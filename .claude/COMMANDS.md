# Comandos

## API (`api/`)
```bash
npm run start:dev      # Dev hot-reload
npm run build          # Build prod
npm run lint           # Lint + fix
npm run test           # Tests
npm run test:e2e       # E2E
npx prisma migrate dev # Migraciones
npx prisma generate    # Regenerar cliente
```

## App (`app/`)
```bash
npm run dev   # Dev Quasar
npm run build # Build SPA
npm run lint  # Lint
```

## Docker
```bash
docker compose -f docker/trading/docker-compose.yml up -d
```

## Deploy
Push a `master` -> GitHub Actions via SSH
