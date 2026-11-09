"""Unir cargas del borrador anterior con una nueva interpretación del hilo."""

from __future__ import annotations

import re

from volty.core.schemas import LoadSpec, ParsedIntent


def _load_family(name: str, load_id: str | None = None) -> str:
    text = f"{name} {load_id or ''}".lower()
    for token in (
        "acs",
        "bomba",
        "calef",
        "lavavajillas",
        "lavadora",
        "secadora",
        "coche",
        "vehículo",
        "vehiculo",
        "wallbox",
    ):
        if token in text:
            if token in ("vehículo", "vehiculo", "wallbox"):
                return "coche"
            if token == "bomba" and "calor" in text:
                return "acs"
            return token
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "carga"


def merge_load_specs(existing: list[LoadSpec], incoming: list[LoadSpec]) -> list[LoadSpec]:
    by_family: dict[str, LoadSpec] = {}
    for load in existing:
        by_family[_load_family(load.name, load.id)] = load
    for load in incoming:
        by_family[_load_family(load.name, load.id)] = load
    merged = list(by_family.values())
    merged.sort(key=lambda item: item.deadline)
    return merged


def merge_parsed_intents(old: ParsedIntent | None, new: ParsedIntent) -> ParsedIntent:
    if old is None or not old.loads:
        return new
    if len(new.loads) >= len(old.loads) and new.confidence == "llm":
        return new
    loads = merge_load_specs(old.loads, new.loads)
    prefs = new.preferences if new.confidence == "llm" else old.preferences
    explanation = new.explanation or old.explanation
    confidence = new.confidence if new.confidence == "llm" else old.confidence
    return ParsedIntent(
        loads=loads,
        preferences=prefs,
        explanation=explanation,
        confidence=confidence,
    )
