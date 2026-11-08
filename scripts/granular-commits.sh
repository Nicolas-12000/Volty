#!/usr/bin/env bash
# Uso interno: muchos commits atómicos con mensajes derivados de la ruta.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

msg_for() {
  local f="$1"
  case "$f" in
    docs/*) echo "docs: $(basename "$f" .md | tr '_' '-')";;
    backend/alembic/*) echo "db: migración $(basename "$f" .py)";;
    backend/handlers/*) echo "lambda: handler $(basename "$f" .py)";;
    backend/tests/*) echo "test: $(basename "$f")";;
    backend/volty/api/routers/*) echo "api: router $(basename "$f" .py)";;
    backend/volty/application/*) echo "app: $(basename "$f" .py)";;
    backend/volty/assistant/*) echo "matias: $(basename "$f" .py)";;
    backend/volty/gemini/*) echo "gemini: $(basename "$f" .py)";;
    frontend/components/*) echo "ui: $(basename "$f" .tsx)";;
    frontend/app/*) echo "page: $(basename "$(dirname "$f")")/$(basename "$f")";;
    frontend/lib/*) echo "front: lib $(basename "$f")";;
    frontend/hooks/*) echo "front: hook $(basename "$f")";;
    infra/cloudformation/*) echo "infra: cfn $(basename "$f")";;
    infra/terraform/*) echo "infra: tf $(basename "$f")";;
    scripts/*) echo "chore: script $(basename "$f")";;
    .github/*) echo "ci: $(basename "$f")";;
    *) echo "chore: $f";;
  esac
}

# Pares lógicos (varios archivos, un commit)
commit_batch() {
  local msg="$1"; shift
  [[ $# -eq 0 ]] && return 0
  git add -- "$@"
  if git diff --cached --quiet; then return 0; fi
  git commit -m "$msg"
}

# --- orden importa un poco (base antes que features) ---
commit_batch "chore: ampliar gitignore local" .gitignore
commit_batch "chore: Makefile targets dev" Makefile
commit_batch "docs: README raíz" README.md
commit_batch "docs: especificación VOLTY" VOLTY.MD
commit_batch "docs: DESIGN raíz" DESIGN.MD
commit_batch "docs: referencia linear" linear.design.md

for f in docs/*.md; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done

commit_batch "chore: VS Code CloudFormation tags" .vscode/settings.json
commit_batch "chore: backend env ejemplo" backend/.env.example
commit_batch "chore: backend README" backend/README.md
commit_batch "chore: backend requirements" backend/requirements.txt

commit_batch "core: config entorno" backend/volty/core/config.py
commit_batch "core: modelos SQLAlchemy" backend/volty/core/db/models.py
commit_batch "core: esquemas Pydantic" backend/volty/core/schemas.py
commit_batch "ingest: caché precios" backend/volty/ingestion/cache.py
commit_batch "ingest: job ingesta" backend/volty/ingestion/job.py
commit_batch "feat: intérprete NL simplificado" backend/volty/interpreter/service.py
commit_batch "feat: bootstrap FastAPI" backend/volty/main.py

commit_batch "db: migración hilos MATIAS" backend/alembic/versions/002_matias_threads.py
commit_batch "db: migración user_accounts" backend/alembic/versions/003_user_accounts.py

commit_batch "api: utilidades JWT" backend/volty/api/auth.py
commit_batch "api: router raíz" backend/volty/api/router.py
commit_batch "refactor: eliminar routes monolítico" backend/volty/api/routes.py

for f in backend/volty/api/routers/*.py; do
  commit_batch "$(msg_for "$f")" "$f"
done
[[ -f backend/volty/api/routers/__init__.py ]] && commit_batch "api: routers package" backend/volty/api/routers/__init__.py

for f in backend/volty/application/*.py; do
  commit_batch "$(msg_for "$f")" "$f"
done

commit_batch "matias: paquete assistant" backend/volty/assistant/__init__.py
commit_batch "matias: pipeline turnos" backend/volty/assistant/pipeline.py
commit_batch "matias: motor principal" backend/volty/assistant/engine.py
commit_batch "matias: estado y slots" backend/volty/assistant/state.py backend/volty/assistant/slots.py
commit_batch "matias: contexto y normalización" backend/volty/assistant/context.py backend/volty/assistant/normalize.py
commit_batch "matias: seguridad hilos" backend/volty/assistant/security.py
commit_batch "matias: prompts sistema" backend/volty/assistant/prompts.py backend/volty/assistant/prompts/matias_system.md
commit_batch "matias: puertos hexagonal" backend/volty/assistant/ports.py
for f in backend/volty/assistant/backends/*.py; do commit_batch "$(msg_for "$f")" "$f"; done
for f in backend/volty/assistant/memory/*.py; do commit_batch "$(msg_for "$f")" "$f"; done
for f in backend/volty/assistant/rag/*.py; do commit_batch "$(msg_for "$f")" "$f"; done

for f in backend/volty/gemini/*.py; do commit_batch "$(msg_for "$f")" "$f"; done

for f in backend/handlers/*.py; do commit_batch "$(msg_for "$f")" "$f"; done

commit_batch "test: conftest memoria" backend/tests/conftest.py
commit_batch "test: chat MATIAS" backend/tests/test_matias_chat.py
commit_batch "test: seguridad hilo" backend/tests/test_matias_security.py
commit_batch "test: contraseñas" backend/tests/test_passwords.py

for f in infra/cloudformation/*; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done
for f in infra/terraform/*; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done

for f in scripts/*.sh; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done

commit_batch "ci: pipeline pruebas" .github/workflows/ci.yml
commit_batch "ci: workflow deploy" .github/workflows/deploy.yml

commit_batch "front: package y lock npm" frontend/package.json frontend/package-lock.json
commit_batch "front: pnpm workspace" frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml frontend/.npmrc
commit_batch "front: README y diseño" frontend/README.md frontend/DESING.MD
commit_batch "front: global styles" frontend/app/globals.css
commit_batch "front: root layout" frontend/app/layout.tsx
commit_batch "front: home mercado" frontend/app/page.tsx
commit_batch "front: next export estático" frontend/next.config.ts

for f in frontend/app/*/**/page.tsx frontend/app/*/page.tsx frontend/app/**/layout.tsx; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done 2>/dev/null || true
find frontend/app -name 'page.tsx' -o -name 'layout.tsx' | sort | while read -r f; do
  commit_batch "$(msg_for "$f")" "$f"
done

for d in frontend/components/*/; do
  for f in "$d"*.tsx; do
    [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
  done
done

commit_batch "refactor: quitar price-strip legacy" frontend/components/price-strip.tsx
commit_batch "refactor: quitar volty-app monolito" frontend/components/volty-app.tsx

for f in frontend/lib/*; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done
for f in frontend/hooks/*; do
  [[ -f "$f" ]] && commit_batch "$(msg_for "$f")" "$f"
done
commit_batch "front: session provider" frontend/providers/session-provider.tsx

echo "Commits: $(git rev-list --count HEAD)"
