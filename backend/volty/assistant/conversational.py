"""Copy conversacional (variaciones anti-plantilla; fallback sin Gemini)."""

from __future__ import annotations

import re

from volty.assistant.state import ThreadState
from volty.core.schemas import ParsedIntent

_ENERGY_HINTS = (
    "¿Cuántos kWh necesitas? Puedes mandar solo el número (ej. 59).",
    "Me falta la energía — dime kWh o una cifra suelta.",
    "Lo demás lo pillo; ¿cuántos kWh va?",
    "¿De cuántos kWh hablamos? En otro mensaje vale.",
)

_TIME_HINTS = (
    "¿Para qué hora debe estar listo? Ej.: «antes de las 7».",
    "¿Cuándo lo necesitas hecho? Una hora límite alcanza.",
    "Falta la hora — «esta noche», «antes de las 8»…",
)


def _variant(pool: tuple[str, ...], state: ThreadState | None) -> str:
    n = len(state.messages) if state else 0
    return pool[n % len(pool)]


def clarification_message(merged: str, state: ThreadState | None = None) -> str | None:
    has_energy = bool(re.search(r"\d+(?:[.,]\d+)?\s*kwh", merged))
    has_time = bool(
        re.search(
            r"(antes de|para las|a las|\d{1,2}:\d{2}|mañana|tarde|de la manana|esta noche|de noche|antes de dormir)",
            merged,
        )
    )
    charging = any(
        w in merged
        for w in ("carga", "cargar", "veh", "coche", "lavadora", "secadora", "lavavajillas", "movil", "celular")
    )
    if not has_energy and charging:
        return _variant(_ENERGY_HINTS, state)
    if has_energy and not has_time:
        return _variant(_TIME_HINTS, state)
    return None


def conversational_confirm(intent: ParsedIntent) -> str:
    """Confirmación corta para chat (sin volcar el informe técnico)."""
    bits: list[str] = []
    for load in intent.loads:
        short = load.name.split("/")[0].split("—")[0].strip()
        bits.append(f"{short.lower()} ~{load.energy_kwh:g} kWh hasta las {load.deadline.strftime('%H:%M')}")
    joined = "; ".join(bits)
    if len(intent.loads) == 1:
        tail = "Lo ves en el panel si quieres retocar potencia u hora. ¿Otra carga o lo dejamos así?"
    else:
        tail = "Está en el panel el detalle. ¿Añadimos algo más?"
    obj = (
        "priorizo coste"
        if intent.preferences.objective.value == "minimize_cost"
        else "mezclo coste y renovables"
    )
    return f"Perfecto, anotado: {joined}. {obj.capitalize()}. {tail}"
