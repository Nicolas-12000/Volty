"""Extracción y clarificación sobre el hilo completo (no solo el último mensaje)."""

from __future__ import annotations

import re

from volty.assistant.normalize import merge_user_messages, normalize_user_text
from volty.assistant.state import ThreadState
from volty.core.schemas import NaturalLanguageRequest, ParsedIntent
from volty.assistant.load_merge import merge_parsed_intents
from volty.interpreter.service import parse_natural_language


def merged_context(state: ThreadState) -> str:
    user_lines = [m.content for m in state.messages if m.role == "user"]
    return merge_user_messages(user_lines)


def needs_clarification(merged: str, state: ThreadState | None = None) -> str | None:
    from volty.assistant.conversational import clarification_message

    return clarification_message(merged, state)


def _context_load_name_for_tail(state: ThreadState) -> str | None:
    """Último electrodoméstico mencionado en el hilo (para mensajes sueltos tipo «a las 8»)."""
    keywords: tuple[tuple[str, str], ...] = (
        ("lavavajillas", "Lavavajillas"),
        ("lavadora", "Lavadora"),
        ("secadora", "Secadora"),
        ("bomba de calor", "Bomba de calor / ACS"),
        ("acs", "Bomba de calor / ACS"),
        ("coche", "Vehículo eléctrico"),
        ("vehiculo", "Vehículo eléctrico"),
        ("wallbox", "Vehículo eléctrico"),
    )
    for message in reversed(state.messages):
        if message.role != "user":
            continue
        folded = normalize_user_text(message.content)
        for token, name in keywords:
            if token in folded:
                return name
    if state.draft and state.draft.loads:
        return state.draft.loads[-1].name
    return None


def extract_intent(state: ThreadState, context_load_name: str | None) -> ParsedIntent:
    merged = merged_context(state)
    ctx = context_load_name or _context_load_name_for_tail(state)
    fresh = parse_natural_language(NaturalLanguageRequest(message=merged, context_load_name=ctx))
    intent = merge_parsed_intents(state.draft, fresh)

    last_raw = next((m.content for m in reversed(state.messages) if m.role == "user"), "")
    if last_raw.strip():
        tail = normalize_user_text(last_raw)
        try:
            tail_intent = parse_natural_language(
                NaturalLanguageRequest(message=tail, context_load_name=_context_load_name_for_tail(state))
            )
        except ValueError:
            tail_intent = None
        if tail_intent is not None and tail_intent.loads:
            keep_energy = "kwh" not in tail
            intent = merge_parsed_intents(intent, tail_intent, keep_existing_energy=keep_energy)
    return intent


def friendly_summary(intent: ParsedIntent) -> str:
    pref = intent.preferences
    obj = (
        f"coste + renovables (~{pref.renewable_weight:.0%} verde)"
        if pref.objective.value == "balance_cost_renewables"
        else "minimizar coste"
    )
    lines = [
        intent.explanation,
        f"Objetivo del plan: {obj}.",
        "",
        f"Borrador ({len(intent.loads)} carga{'s' if len(intent.loads) != 1 else ''}):",
    ]
    for load in intent.loads:
        extra = " (sin pausas)" if load.must_run else ""
        lines.append(
            f"• {load.name} — {load.energy_kwh:g} kWh, máx. {load.max_power_kw:g} kW, "
            f"antes de {load.deadline.strftime('%H:%M')}{extra}"
        )
    lines.append("")
    lines.append("Nada crítico pendiente: revisa el panel del borrador y lanza el optimizador cuando cuadre.")
    return "\n".join(lines)
