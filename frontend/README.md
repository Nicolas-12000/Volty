# Volty frontend

Despliegue (S3/CloudFront + `NEXT_PUBLIC_API_URL`): [`docs/DEPLOY.md`](../docs/DEPLOY.md).

## Mapa de pantallas

| Ruta | Quién | API |
|------|--------|-----|
| `/` | Todos | `prices`, `renewable-share`, `health` |
| `/analytics` | Todos | `smard`, precios |
| `/entrar` | Invitado | `auth/login` |
| `/hogar` | Sesión | `me/summary` |
| `/hogar/ajustes` | Sesión | `me/profile`, `me/password` |
| `/matias` | Sesión | `chat/*` |
| `/loads`, `/plan` | Sesión | `optimize` + storage local por email |

## Dev

```bash
npm install
npm run dev   # :3000 → rewrite /api a 127.0.0.1:8000
```

## Producción (estático)

```bash
NEXT_PUBLIC_API_URL=https://tu-api.../api VOLTY_STATIC_EXPORT=1 npm run build
# publicar frontend/out
```
