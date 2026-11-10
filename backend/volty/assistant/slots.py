"""Extracción y clarificación sobre el hilo completo (no solo el último mensaje)."""

from __future__ import annotations

import re

from volty.assistant.normalize import merge_user_messages, normalize_user_text
from volty.assistant.state import ThreadState
from volty.core.schemas import LoadSpec, NaturalLanguageRequest, ParsedIntent
from volty.assistant.load_merge import merge_parsed_intents
from volty.interpreter.service import parse_line_intent, parse_natural_language


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
        ("movil", "Cargador móvil"),
        ("móvil", "Cargador móvil"),
        ("celular", "Cargador móvil"),
        ("smartphone", "Cargador móvil"),
        ("telefono", "Cargador móvil"),
        ("pc", "Ordenador / PC"),
        ("ordenador", "Ordenador / PC"),
        ("portatil", "Ordenador / PC"),
        ("laptop", "Ordenador / PC"),
        ("tablet", "Tablet"),
        ("consola", "Consola"),
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


def _context_from_line(line: str) -> str | None:
    folded = normalize_user_text(line)
    keywords: tuple[tuple[str, str], ...] = (
        ("lavavajillas", "Lavavajillas"),
        ("lavadora", "Lavadora"),
        ("secadora", "Secadora"),
        ("pc", "Ordenador / PC"),
        ("ordenador", "Ordenador / PC"),
        ("portatil", "Ordenador / PC"),
        ("celular", "Cargador móvil"),
        ("movil", "Cargador móvil"),
        ("coche", "Vehículo eléctrico"),
        ("vehiculo", "Vehículo eléctrico"),
        ("wallbox", "Vehículo eléctrico"),
        ("tablet", "Tablet"),
        ("consola", "Consola"),
    )
    for token, name in keywords:
        if token in folded:
            return name
    return None


def extract_intent(state: ThreadState, context_load_name: str | None) -> ParsedIntent:
    intent = state.draft
    for line in [m.content for m in state.messages if m.role == "user"]:
        text = line.strip()
        if not text:
            continue
        try:
            piece = parse_line_intent(text, _context_from_line(text))
        except ValueError:
            continue
        intent = merge_parsed_intents(intent, piece)

    merged = merged_context(state)
    ctx = context_load_name or _context_load_name_for_tail(state)
    fresh = parse_natural_language(NaturalLanguageRequest(message=merged, context_load_name=ctx))
    intent = merge_parsed_intents(intent, fresh)

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
    return _apply_standard_phrases(state, intent)


_STANDARD_PHRASE = re.compile(
    r"\b(estandar|estándar|valor estandar|uno estandar|lo tipico|lo típico|normal)\b",
    re.I,
)


def _apply_standard_phrases(state: ThreadState, intent: ParsedIntent) -> ParsedIntent:
    """«Uno estándar» → energía por defecto del aparato que se estaba hablando."""
    last = next((m.content for m in reversed(state.messages) if m.role == "user"), "")
    if not last or not _STANDARD_PHRASE.search(normalize_user_text(last)):
        return intent
    target = _context_load_name_for_tail(state)
    if not target:
        return intent
    from volty.assistant.load_merge import _load_family as family

    fam = family(target)
    loads: list[LoadSpec] = []
    hit = False
    for load in intent.loads:
        if family(load.name, load.id) == fam:
            if fam == "movil":
                loads.append(load.model_copy(update={"energy_kwh": 0.1}))
            else:
                loads.append(load)
            hit = True
        else:
            loads.append(load)
    if not hit:
        from volty.interpreter.service import parse_natural_language

        synthetic = normalize_user_text(f"{target} 0.1 kwh estandar")
        try:
            extra = parse_natural_language(NaturalLanguageRequest(message=synthetic, context_load_name=target))
            return merge_parsed_intents(intent, extra)
        except ValueError:
            return intent
    return intent.model_copy(update={"loads": loads})


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
