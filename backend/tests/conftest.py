"""Tests deterministas: sin llamadas a Gemini salvo tests explícitos del cliente."""

from __future__ import annotations

import os
from pathlib import Path

import pytest


@pytest.fixture(scope="session", autouse=True)
def _apply_migrations_when_database_url() -> None:
    """CI define DATABASE_URL pero no migra a mano: creamos el esquema antes de pytest."""
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        return
    from alembic import command
    from alembic.config import Config

    from volty.core.db.session import check_database_connection

    if not check_database_connection():
        return

    backend = Path(__file__).resolve().parent.parent
    cfg = Config(str(backend / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")


@pytest.fixture(autouse=True)
def _disable_gemini_intent_parser(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "volty.interpreter.service.parse_intent_with_gemini",
        lambda _message: None,
    )
