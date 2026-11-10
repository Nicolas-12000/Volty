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
        "movil",
        "celular",
        "smartphone",
        "telefono",
        "pc",
        "ordenador",
        "portatil",
        "laptop",
        "tablet",
        "consola",
        "ebike",
        "patinete",
        "roomba",
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


def merge_load_specs(
    existing: list[LoadSpec],
    incoming: list[LoadSpec],
    *,
    keep_existing_energy: bool = False,
) -> list[LoadSpec]:
    by_family: dict[str, LoadSpec] = {}
    for load in existing:
        by_family[_load_family(load.name, load.id)] = load
    for load in incoming:
        fam = _load_family(load.name, load.id)
        prev = by_family.get(fam)
        if prev is not None and keep_existing_energy:
            load = load.model_copy(
                update={"energy_kwh": prev.energy_kwh, "max_power_kw": prev.max_power_kw},
            )
        by_family[fam] = load
    merged = list(by_family.values())
    merged.sort(key=lambda item: item.deadline)
    return merged


def merge_parsed_intents(
    old: ParsedIntent | None,
    new: ParsedIntent,
    *,
    keep_existing_energy: bool = False,
) -> ParsedIntent:
    if old is None or not old.loads:
        return new
    if not new.loads:
        return old
    loads = merge_load_specs(old.loads, new.loads, keep_existing_energy=keep_existing_energy)
    prefs = new.preferences if new.confidence == "llm" else old.preferences
    explanation = new.explanation or old.explanation
    confidence = new.confidence if new.confidence == "llm" else old.confidence
    return ParsedIntent(
        loads=loads,
        preferences=prefs,
        explanation=explanation,
        confidence=confidence,
    )
