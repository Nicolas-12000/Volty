#!/usr/bin/env bash
# Zip para Lambda API (límite AWS: 250 MB descomprimido). Ver backend/requirements-lambda.txt
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
OUT="$ROOT/infra/build"
LIMIT=$((250 * 1024 * 1024))
PIP="${BACKEND}/.venv/bin/pip"

[[ -x "$PIP" ]] || { echo "make setup-backend" >&2; exit 1; }

work="$OUT/api"
rm -rf "$work"
mkdir -p "$work/handlers"

# Solo usa el pip del venv como lanzador; -t instala en infra/build/api (NO en .venv ni en /usr).
echo "==> pip install --target $work (requirements-lambda.txt)"
"$PIP" install -r "$BACKEND/requirements-lambda.txt" -t "$work" --quiet --no-cache-dir --no-user
cp -r "$BACKEND/volty" "$BACKEND/alembic" "$BACKEND/alembic.ini" "$work/"
cp "$BACKEND/handlers/api.py" "$work/handler.py"
cp "$BACKEND/handlers/migrate.py" "$work/handlers/"
touch "$work/handlers/__init__.py"

find "$work" -type d \( -name tests -o -name __pycache__ \) -exec rm -rf {} + 2>/dev/null || true

size=$(du -sb "$work" | cut -f1)
if (( size > LIMIT )); then
  echo "ERROR: bundle ${size} bytes > ${LIMIT} (250 MB Lambda)" >&2
  exit 1
fi
echo "Bundle OK: $(( size / 1024 / 1024 )) MB"

zip_out="$OUT/api.zip"
rm -f "$zip_out"
if command -v zip >/dev/null; then
  (cd "$work" && zip -qr "../api.zip" .)
else
  "$BACKEND/.venv/bin/python" - "$work" "$zip_out" <<'PY'
import sys, zipfile
from pathlib import Path
root, out = Path(sys.argv[1]), Path(sys.argv[2])
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in root.rglob("*"):
        if p.is_file():
            zf.write(p, p.relative_to(root).as_posix())
PY
fi
ls -lh "$zip_out"
