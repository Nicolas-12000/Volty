"""Lambda one-shot: alembic upgrade head (mismo zip que API; sin abrir RDS a internet)."""

from __future__ import annotations


def lambda_handler(event, context):
    from alembic import command
    from alembic.config import Config
    from pathlib import Path

    ini = Path(__file__).resolve().parents[1] / "alembic.ini"
    cfg = Config(str(ini))
    command.upgrade(cfg, "head")
    return {"statusCode": 200, "body": "migrations ok"}
