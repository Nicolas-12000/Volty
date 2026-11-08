# MATIAS — arquitectura agnóstica

MATIAS es el asistente de Volty. El código no asume una nube ni un proveedor de IA concretos.

## ¿RAG o buen prompt?

| Enfoque | Cuándo usarlo en Volty |
|---------|------------------------|
| **Prompt + memoria de hilo + reglas/LLM** | **MVP (ahora).** El dominio es acotado: cargas, kWh, deadline, objetivo. Multi-turno y texto mal escrito se cubren fusionando mensajes + normalización + (opcional) LLM. |
| **RAG** | Cuando haga falta contexto **externo al turno**: tarifas del usuario, manual del cargador, historial largo en PDF, normativa regional. Implementar `KnowledgeRetriever` (ver `volty/assistant/rag/`). |
| **Fine-tuning** | Casi nunca en MVP; cambiar prompt o modelo suele bastar. |

**Recomendación:** `MATIAS_BACKEND=gemini` + `GEMINI_API_KEY` en producción; sin clave, reglas locales. RAG solo cuando tengáis un `KnowledgeRetriever` real.

## Capas (puertos)

```text
API /chat
  → MatiasEngine (orquestación)
      → ThreadStore      (memoria: in_memory | futuro: postgres | dynamodb)
      → KnowledgeRetriever (none | tu implementación RAG)
      → AssistantBackend (gemini | rules)
      → prompts/matias_system.md (editable sin tocar código)
```

Variables de entorno (`backend/.env`):

| Variable | Valores | Efecto |
|----------|---------|--------|
| `MATIAS_BACKEND` | `gemini` (default), `rules` | Gemini si hay `GEMINI_API_KEY`; si no, reglas |
| `GEMINI_API_KEY` | secreto | API de Google Gemini |
| `MATIAS_RAG` | `none` (default) | Inyectar snippets en el prompt |
| `MATIAS_PROMPT_PATH` | ruta opcional | Sustituye el system prompt |

## Cambiar proveedor de IA

1. Crear `volty/assistant/backends/tu_proveedor.py` implementando `AssistantBackend`.
2. Registrar en `volty/assistant/backends/registry.py`.
3. Añadir valor a `MATIAS_BACKEND` en config.

## Cambiar almacén de memoria

1. Implementar `ThreadStore` en `volty/assistant/memory/`.
2. Registrar en `volty/assistant/memory/registry.py`.

## API de conversación

- `POST /api/chat` — mensaje nuevo (`thread_id` + `message`) o sincronización legacy (`messages[]`).
- `GET /api/chat/threads/{id}` — recuperar hilo (memoria servidor).
- `PATCH /api/chat/threads/{id}/draft` — editar borrador antes de guardar cargas.
- `DELETE /api/chat/threads/{id}` — nueva conversación.

El front persiste `thread_id` en `localStorage` y muestra editor de borrador tipo «revisar antes de aplicar».

## Seguridad (prompt injection y secretos)

Capas en `volty/assistant/security.py`:

1. **Entrada:** límite de tamaño, heurísticas de inyección → respuesta fija `backend=policy` **sin llamar al LLM**.
2. **Prompt:** el system prompt nunca incluye email ni variables de entorno; mensajes del usuario van envueltos en `<user_message>`.
3. **Salida:** filtro de patrones (API keys, JWT, `DATABASE_URL`, tokens tipo `AIza…` / `sk-…`) → mensaje genérico al usuario.

No sustituye WAF ni revisión humana; amplía patrones en `security.py` según incidentes.
