#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
OUT="$ROOT/infra/build"
PIP="${BACKEND}/.venv/bin/pip"
PY="${BACKEND}/.venv/bin/python"

if [[ ! -x "$PIP" ]]; then
  echo "make setup-backend" >&2
  exit 1
fi

mkdir -p "$OUT"
work="$OUT/api"
rm -rf "$work"
mkdir -p "$work/handlers"
"$PIP" install -r "$BACKEND/requirements.txt" -t "$work" --quiet
cp -r "$BACKEND/volty" "$work/"
cp "$BACKEND/handlers/api.py" "$work/handler.py"
cp "$BACKEND/handlers/migrate.py" "$work/handlers/"
touch "$work/handlers/__init__.py"
cp -r "$BACKEND/alembic" "$work/"
cp "$BACKEND/alembic.ini" "$work/"
if command -v zip >/dev/null 2>&1; then
  (cd "$work" && zip -qr "../api.zip" .)
else
  "$PY" - <<PY
import pathlib, zipfile
root = pathlib.Path("$work")
out = pathlib.Path("$OUT/api.zip")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in root.rglob("*"):
        if p.is_file():
            zf.write(p, p.relative_to(root).as_posix())
PY
fi
echo "built $OUT/api.zip"
