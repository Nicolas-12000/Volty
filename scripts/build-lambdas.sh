#!/usr/bin/env bash
# Empaqueta Lambdas Volty (ejecutar desde la raíz del repo; usa backend/.venv).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
OUT="$ROOT/infra/build"
PIP="${BACKEND}/.venv/bin/pip"
PY="${BACKEND}/.venv/bin/python"

if [[ ! -x "$PIP" ]]; then
  echo "Crea el venv: make setup-backend" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

pack() {
  local name="$1"
  local work="$OUT/$name"
  mkdir -p "$work"
  "$PIP" install -r "$BACKEND/requirements.txt" -t "$work" --quiet
  cp -r "$BACKEND/volty" "$work/"
  cp "$BACKEND/handlers/${name}.py" "$work/handler.py"
  if command -v zip >/dev/null 2>&1; then
    (cd "$work" && zip -qr "../${name}.zip" .)
  else
  "$PY" - <<PY
import pathlib, zipfile
root = pathlib.Path("$work")
out = pathlib.Path("$OUT") / "${name}.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in root.rglob("*"):
        if p.is_file():
            zf.write(p, p.relative_to(root).as_posix())
print(f"built {out}")
PY
  fi
  echo "built infra/build/${name}.zip"
}

pack api
pack ingestion
pack ai
pack optimization
