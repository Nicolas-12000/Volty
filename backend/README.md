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

Desde la raíz del repo: `make db-up && make db-migrate` (PostgreSQL en Docker).

## Variables de entorno (`backend/.env`)

```env
DATABASE_URL=postgresql+psycopg://volty:volty@127.0.0.1:5432/volty
OPENAI_API_KEY=
```

## Ejecutar

```bash
cd backend
.venv/bin/uvicorn volty.main:app --reload --host 127.0.0.1 --port 8000
```

Documentación interactiva: http://127.0.0.1:8000/docs — `/api/health` comprueba la BD.

## Migraciones (Alembic)

```bash
cd backend
.venv/bin/alembic upgrade head
.venv/bin/alembic revision -m "descripcion" --autogenerate  # futuras
```

## Tests

```bash
cd backend
.venv/bin/pytest -q
```

(Los tests unitarios no requieren PostgreSQL; la API en runtime sí.)

## Limpiar venv

```bash
rm -rf backend/.venv
```

Persistencia: PostgreSQL (`api_cache_entries`, `ingested_snapshots`).
