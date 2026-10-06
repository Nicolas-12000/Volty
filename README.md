# Volty

Planificación y optimización del consumo eléctrico con datos reales (Energy-Charts / SMARD). Especificación en [`VOLTY.MD`](VOLTY.MD).

## Estructura

| Ruta | Qué es |
|------|--------|
| `backend/` | API FastAPI — **solo usar `backend/.venv`**, nunca pip global |
| `frontend/` | UI Vite + TypeScript |
| `Makefile` | Comandos habituales de setup, test y dev |

## Requisitos

- Python 3.11+
- Node.js 20+ (`pnpm` o `npm` en `frontend/`)
- Make (opcional pero recomendado)

## Primer uso

```bash
make setup
make db-up          # PostgreSQL 16 en Docker (:5432)
make db-migrate     # tablas api_cache_entries + ingested_snapshots
cp backend/.env.example backend/.env
make test
```

En dos terminales:

```bash
make dev-backend    # http://127.0.0.1:8000 — /health incluye estado de BD
make dev-frontend   # http://127.0.0.1:5173
```

Sin Make, mismos pasos en [`backend/README.md`](backend/README.md).

## Base de datos

PostgreSQL es el almacén principal (caché con TTL + histórico JSONB de ingesta). Configuración vía `DATABASE_URL` en `backend/.env`. Despliegue futuro: misma URL apuntando al servicio gestionado (RDS, Cloud SQL, etc.).

## Git

El repo ignora entornos locales (`.venv`, `node_modules`, `.env`). Tras clonar, siempre `make setup` y `make db-up && make db-migrate`.

```bash
git init            # si aún no hay repo remoto
git add .
git status          # revisar que no entren secretos ni .venv
```

## Variables de entorno

`backend/.env` (no commitear):

- `OPENAI_API_KEY` — interpretación NL con LLM; sin clave, reglas en español.

## Licencia / datos externos

Precios vía [Energy-Charts](https://energy-charts.info/) (respetar límites de tasa y licencias indicadas en la API).
