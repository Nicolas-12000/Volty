from __future__ import annotations

from pathlib import Path

from volty.core.config import settings

_DEFAULT = Path(__file__).resolve().parent / "prompts" / "matias_system.md"


def load_system_prompt() -> str:
    path = settings.matias_prompt_path
    chosen = Path(path) if path else _DEFAULT
    if chosen.is_file():
        return chosen.read_text(encoding="utf-8").strip()
    return _DEFAULT.read_text(encoding="utf-8").strip()
