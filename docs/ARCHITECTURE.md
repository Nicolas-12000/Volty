# Volty — monolito modular

Un solo despliegue (uvicorn / Lambda `api`), capas con **alta cohesión** y **bajo acoplamiento**:

```text
HTTP (api/routers/*)     →  solo traduce status codes
application/*            →  casos de uso (planning, market)
assistant/* + optimizer/ →  dominio MATIAS y LP
ingestion/*              →  Energy-Charts, SMARD, caché
gemini/*                 →  único cliente LLM (Google)
core/*                   →  schemas, config, DB
```

## Reglas

- **Sin controllers de más:** no hay capa “Controller” aparte; los routers son ~10 líneas por endpoint.
- **Un cliente de mercado** (`application/market.py`) evita N instancias de `EnergyChartsClient` (cuello de botella de conexiones).
- **Un cliente Gemini** (`gemini/client.py`) para chat e intent JSON.
- **IA:** solo Gemini (+ reglas offline si no hay clave). No OpenAI en el árbol.
- **MATIAS:** `pipeline.resolve_slots` compartido; backends `rules` / `gemini` intercambiables vía registry.

## Hilos MATIAS

- `MATIAS_THREAD_STORE=auto` (default): Postgres si `DATABASE_URL` responde; si no, RAM (dev/tests).
- `memory` | `postgres` fuerzan el backend.
- Tabla `matias_threads` (Alembic `002`); mensajes y borrador en JSONB.
- `ThreadStore` en `assistant/ports.py` — mismo contrato para RAM y Postgres.

## Próxima deuda aceptable

- Rate limit en `/api/chat` (evitar abuso de Gemini).
