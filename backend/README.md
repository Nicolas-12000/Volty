# Volty — backend

API FastAPI para precios (Energy-Charts), interpretación NL y optimización de cargas.

## Entorno Python (obligatorio: venv local)

No instalar dependencias en el Python del sistema. Usar solo `backend/.venv`:

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -r requirements-dev.txt
```

Variables opcionales en `backend/.env`:

```env
OPENAI_API_KEY=sk-...
```

## Ejecutar

```bash
cd backend
.venv/bin/uvicorn volty.main:app --reload --host 127.0.0.1 --port 8000
```

Documentación interactiva: http://127.0.0.1:8000/docs

## Tests

```bash
cd backend
.venv/bin/pytest -q
```

## Limpiar venv

```bash
rm -rf backend/.venv
```

La caché de APIs externas vive en `backend/data/cache/` (gitignored).
