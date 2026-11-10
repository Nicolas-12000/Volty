"""Tests deterministas: sin llamadas a Gemini salvo tests explícitos del cliente."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _disable_gemini_intent_parser(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "volty.interpreter.service.parse_intent_with_gemini",
        lambda _message: None,
    )
