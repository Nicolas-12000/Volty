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
make setup          # venv + dependencias Python y npm
cp backend/.env.example backend/.env   # opcional: OPENAI_API_KEY
make test           # comprobar optimizador
```

En dos terminales:

```bash
make dev-backend    # http://127.0.0.1:8000 — docs en /docs
make dev-frontend   # http://127.0.0.1:5173 — proxy /api → backend
```

Sin Make, mismos pasos en [`backend/README.md`](backend/README.md).

## Git

El repo ignora entornos locales (`.venv`, `node_modules`, caché de APIs, `.env`). Tras clonar, siempre `make setup`.

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
