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

- **Sin controllers de más:** los routers son ~10 líneas por endpoint.
- **Un cliente de mercado** (`application/market.py`) para Energy-Charts/SMARD.
- **Un cliente Gemini** (`gemini/client.py`) para chat e intent JSON.
- **IA:** Gemini + reglas offline si no hay clave. Sin OpenAI en el árbol.
- **MATIAS:** `pipeline.resolve_slots` compartido; backends `rules` / `gemini` vía registry.

## Mercado (Alemania)

- Precios day-ahead: **Energy-Charts** `bzn=DE-LU` (`settings.bidding_zone`, `Europe/Berlin`).
- Series agregadas: **SMARD** `region=DE`.
- Caché: PostgreSQL si hay `DATABASE_URL`; si no, se omite caché y se consulta la API (Lambda free/student sin bloqueos).

## MATIAS

Asistente agnóstico de nube y proveedor de IA.

| Enfoque | Uso |
|---------|-----|
| Prompt + hilo + reglas/LLM | **MVP actual** |
| RAG | Cuando haga falta contexto externo (`assistant/rag/`) |

```text
POST /api/chat → MatiasEngine
  → ThreadStore (memory | postgres)
  → AssistantBackend (gemini | rules)
  → prompts/matias_system.md
```

| Variable | Efecto |
|----------|--------|
| `MATIAS_THREAD_STORE` | `auto` \| `memory` \| `postgres` |
| `MATIAS_BACKEND` | `gemini` (default) \| `rules` |
| `GEMINI_API_KEY` | Obligatorio en cloud para chat LLM |

Hilos: tabla `matias_threads` (Alembic `002`); cuentas `user_accounts` (`003`).

API conversación: `POST/GET/PATCH/DELETE /api/chat/*` — ver [API_SURFACES.md](./API_SURFACES.md).

Seguridad: `assistant/security.py` (inyección, secretos en salida).

## Próxima deuda aceptable

- Rate limit en `/api/chat` (abuso Gemini).
- WAF / API Gateway delante de Function URL en prod.
