"""Limpieza ligera para texto coloquial / mal escrito (sin depender de un LLM)."""

from __future__ import annotations

import re
import unicodedata

# Sustituciones frecuentes en español (ampliar aquí, no en la UI).
_TYPO_PAIRS: tuple[tuple[str, str], ...] = (
    (r"\bcohce\b", "coche"),
    (r"\bvehiculo\b", "vehículo"),
    (r"\behiculo\b", "vehículo"),
    (r"\bcargador\b", "cargar"),
    (r"\bkwhh\b", "kwh"),
    (r"\b7am\b", "7 de la mañana"),
    (r"\b7\s*am\b", "7 de la mañana"),
    (r"\bpm\b", "tarde"),
)


def normalize_user_text(text: str) -> str:
    folded = unicodedata.normalize("NFKD", text)
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    out = folded.lower().strip()
    out = re.sub(r"\s+", " ", out)
    for pattern, repl in _TYPO_PAIRS:
        out = re.sub(pattern, repl, out, flags=re.I)
    if "kwh" not in out:
        out = re.sub(r"\b(\d+(?:[.,]\d+)?)\s*k[w]\b", r"\1 kwh", out)
    return out


def merge_user_messages(messages: list[str]) -> str:
    parts = [normalize_user_text(m) for m in messages if m.strip()]
    return " ".join(parts)
