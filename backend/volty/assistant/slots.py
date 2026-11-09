"""Extracción y clarificación sobre el hilo completo (no solo el último mensaje)."""

from __future__ import annotations

import re

from volty.assistant.normalize import merge_user_messages
from volty.assistant.state import ThreadState
from volty.core.schemas import NaturalLanguageRequest, ParsedIntent
from volty.assistant.load_merge import merge_parsed_intents
from volty.interpreter.service import parse_natural_language


def merged_context(state: ThreadState) -> str:
    user_lines = [m.content for m in state.messages if m.role == "user"]
    return merge_user_messages(user_lines)


def needs_clarification(merged: str) -> str | None:
    has_energy = bool(re.search(r"\d+(?:[.,]\d+)?\s*kwh", merged))
    has_time = bool(
        re.search(r"(antes de|para las|a las|\d{1,2}:\d{2}|mañana|tarde|de la mañana)", merged)
    )
    if not has_energy and any(w in merged for w in ("carga", "cargar", "veh", "coche", "lavadora")):
        return (
            "Para armar la carga necesito la energía en kWh (ej. «45 kWh»). "
            "Puedes enviarlo en otro mensaje."
        )
    if has_energy and not has_time:
        return "¿Antes de qué hora debe estar lista? Ej.: «antes de las 7»."
    return None


def extract_intent(state: ThreadState, context_load_name: str | None) -> ParsedIntent:
    merged = merged_context(state)
    fresh = parse_natural_language(NaturalLanguageRequest(message=merged, context_load_name=context_load_name))
    return merge_parsed_intents(state.draft, fresh)


def friendly_summary(intent: ParsedIntent) -> str:
    lines = [
        intent.explanation,
        "",
        f"Borrador ({len(intent.loads)} carga{'s' if len(intent.loads) != 1 else ''}):",
    ]
    for load in intent.loads:
        lines.append(
            f"• {load.name} — {load.energy_kwh:g} kWh, máx. {load.max_power_kw:g} kW, "
            f"antes de {load.deadline.strftime('%H:%M')}"
        )
    lines.append("Revisa el borrador abajo; puedes editarlo antes de guardar.")
    return "\n".join(lines)
