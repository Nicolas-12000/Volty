"""Lambda one-shot: alembic upgrade head (mismo zip que API; sin abrir RDS a internet)."""

from __future__ import annotations


def lambda_handler(event, context):
    from alembic import command
    from alembic.config import Config
    from pathlib import Path

    ini = Path(__file__).resolve().parents[1] / "alembic.ini"
    cfg = Config(str(ini))
    command.upgrade(cfg, "head")
    try:
        from volty.application.account import ensure_demo_user_seeded
        from volty.application.demo_seed import ensure_demo_presentation_seed

        ensure_demo_user_seeded()
        ensure_demo_presentation_seed()
    except Exception:
        pass
    return {"statusCode": 200, "body": "migrations ok"}
