# Volty

Planificación y optimización del consumo eléctrico (mercado **DE-LU**, datos Energy-Charts / SMARD). Especificación: [`VOLTY.MD`](VOLTY.MD).

## Estructura

| Ruta | Qué es |
|------|--------|
| `backend/` | API FastAPI — usar solo `backend/.venv` |
| `frontend/` | Next.js (mercado + hogar + MATIAS) |
| `infra/cloudformation/` | AWS: free, student, prod, CDN |
| `scripts/` | Build Lambda y despliegue |
| `docs/` | [**DEPLOY.md**](docs/DEPLOY.md), arquitectura, API |

## Local (desarrollo)

```bash
make setup
make db-up && make db-migrate
cp backend/.env.example backend/.env   # GEMINI_API_KEY
make test
make dev-backend    # http://127.0.0.1:8000
make dev-frontend   # http://127.0.0.1:3000
```

## Despliegue AWS (resumen)

**Plan estudiante / demo completa:**

```bash
export AWS_PROFILE=volty-deploy AWS_DEFAULT_REGION=eu-central-1
cp infra/cloudformation/params.example.json infra/cloudformation/params.json
# JwtSecret + GeminiApiKey
./scripts/deploy-aws.sh
```

Guía completa, modos free/prod y front: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Variables sensibles

- `backend/.env`, `infra/cloudformation/params.json` — **no commitear** (`.gitignore`).

## Licencia / datos externos

Precios vía [Energy-Charts](https://energy-charts.info/); respetar límites y licencia de la API.
