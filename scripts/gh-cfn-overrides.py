#!/usr/bin/env python3
"""Emite líneas ParameterKey=value para `aws cloudformation deploy --parameter-overrides`."""

from __future__ import annotations

import os
import sys


def _require(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        print(f"Falta variable de entorno: {name}", file=sys.stderr)
        sys.exit(1)
    return val


def main() -> None:
    bucket = _require("BUCKET")
    jwt = _require("JWT_SECRET")
    db = _require("VOLTY_DB_PASSWORD")
    gemini = os.environ.get("GEMINI_API_KEY", "").strip()
    cors = os.environ.get("CORS_ORIGINS", "http://localhost:3000").strip()

    if len(db) < 16:
        print("VOLTY_DB_PASSWORD debe tener al menos 16 caracteres", file=sys.stderr)
        sys.exit(1)
    if len(jwt) < 32:
        print("VOLTY_JWT_SECRET debe tener al menos 32 caracteres", file=sys.stderr)
        sys.exit(1)

    rows = {
        "ArtifactsBucket": bucket,
        "JwtSecret": jwt,
        "DbPassword": db,
        "GeminiApiKey": gemini,
        "CorsOrigins": cors,
    }
    for key, value in rows.items():
        print(f"{key}={value}")


if __name__ == "__main__":
    main()
