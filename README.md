# Volty

Planificación y optimización del consumo eléctrico (mercado **DE-LU**, datos Energy-Charts / SMARD). Especificación: [`VOLTY.MD`](VOLTY.MD).

## Antes de nada: ¿dónde estoy?

Los comandos `make …` **solo funcionan en la raíz del repo**, la carpeta que contiene el `Makefile`:

```text
volty/
├── Makefile          ← aquí ejecutas make
├── backend/
├── frontend/
└── docs/
```

Compruébalo:

```bash
cd ~/proyectos/Mideros\ miderosos/volty   # ajusta la ruta a tu clone
ls Makefile backend frontend
```

Si estás dentro de `backend/` y corres `make dev-backend` o `cp backend/.env.example …`, **fallará** — ahí no hay `Makefile` y la ruta `backend/.env.example` no existe (el ejemplo está en `.env.example` dentro de esa misma carpeta).

## Requisitos

- Python 3.11+ (venv en `backend/.venv`)
- Node.js 20+ (frontend)
- Docker (PostgreSQL local con `make db-up`)

## Primera vez (setup)

Desde la **raíz** `volty/`:

```bash
make setup
make db-up && make db-migrate
cp backend/.env.example backend/.env
# Edita backend/.env si quieres MATIAS con Gemini (GEMINI_API_KEY)
make test
```

## Desarrollo local (día a día)

Abre **dos terminales**, ambas en la raíz `volty/`:

| Terminal | Comando | URL |
|----------|---------|-----|
| 1 | `make dev-backend` | API → http://127.0.0.1:8000 |
| 2 | `make dev-frontend` | UI → http://127.0.0.1:3000 |

El frontend en `:3000` envía `/api/*` al backend en `:8000`. Si solo levantas el front, el mercado y el login no tendrán datos.

Comprobar que la API responde:

```bash
curl -s http://127.0.0.1:8000/api/health
```

**Usuario demo** (si existe tras migraciones): `demo@volty.dev` / `valle-0700` (ver `backend/.env.example`).

## Si prefieres no usar `make`

**Backend** (desde `volty/backend/`, con venv ya creado con `make setup-backend`):

```bash
cd backend
cp .env.example .env
./.venv/bin/uvicorn volty.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend** (desde `volty/frontend/`):

```bash
cd frontend
npm run dev
```

## Comandos útiles (`make` en la raíz)

```bash
make help              # lista de targets
make setup-backend     # solo Python + dependencias
make setup-frontend    # solo npm install
make db-down           # para PostgreSQL en Docker
make ingest            # precios Energy-Charts → DB (opcional)
```

## Estructura del repo

| Ruta | Qué es |
|------|--------|
| `backend/` | API FastAPI — entorno virtual **solo** en `backend/.venv` |
| `frontend/` | Next.js (mercado, hogar, MATIAS) |
| `infra/cloudformation/` | AWS: `volty.yaml` (+ CDN opcional) |
| `scripts/` | Build Lambda y despliegue |
| `docs/` | [**DEPLOY.md**](docs/DEPLOY.md), arquitectura, API |

## Despliegue AWS (resumen)

Guía completa: **[docs/DEPLOY.md](docs/DEPLOY.md)** · Apagar AWS: `./scripts/teardown-aws.sh`

```bash
export AWS_PROFILE=tu-perfil AWS_DEFAULT_REGION=eu-central-1
cp infra/cloudformation/params.example.json infra/cloudformation/params.json
# Rellena JwtSecret, GeminiApiKey y DbPassword en params.json
./scripts/deploy-aws.sh
```

## Variables sensibles

- `backend/.env`, `infra/cloudformation/params.json` — **no commitear** (`.gitignore`).

## Licencia / datos externos

Precios vía [Energy-Charts](https://energy-charts.info/); respetar límites y licencia de la API.
