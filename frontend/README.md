# Volty — frontend (Next.js + Relieve)

Generado con [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Identidad en [`DESING.MD`](./DESING.MD).

## Desarrollo

```bash
cd frontend
npm install
npm run dev
```

UI en [http://localhost:3000](http://localhost:3000). Las rutas `/api/*` se reescriben al backend FastAPI (`next.config.ts`, por defecto `http://127.0.0.1:8000`).

Desde la raíz del repo: `make dev-frontend` (con el backend en `make dev-backend`).

## Variables

- `VOLTY_API_URL` — origen del API en build/runtime (opcional).
