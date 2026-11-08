from __future__ import annotations

import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.core.config import settings
from volty.core.schemas import LoadSpec, NaturalLanguageRequest, Objective, OptimizationPreferences, ParsedIntent
from volty.gemini.intent import parse_intent_with_gemini


def parse_natural_language(request: NaturalLanguageRequest) -> ParsedIntent:
    text = request.message.strip().lower()
    if not text:
        raise ValueError("Mensaje vacío.")

    gemini = parse_intent_with_gemini(request.message)
    if gemini:
        return gemini

    return _rule_based_parse(text, request.context_load_name)


def _rule_based_parse(text: str, default_name: str | None) -> ParsedIntent:
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)

    energy_kwh = 30.0
    energy_match = re.search(r"(\d+(?:[.,]\d+)?)\s*kwh", text)
    if energy_match:
        energy_kwh = float(energy_match.group(1).replace(",", "."))

    max_power_kw = 11.0
    power_match = re.search(r"(\d+(?:[.,]\d+)?)\s*kw", text)
    if power_match and "kwh" not in text[power_match.start() : power_match.end() + 1]:
        max_power_kw = float(power_match.group(1).replace(",", "."))

    deadline = _parse_deadline(text, now, tz)
    objective = Objective.MINIMIZE_COST
    renewable_weight = 0.0
    if "renovable" in text or "verde" in text or "solar" in text or "eólic" in text:
        objective = Objective.BALANCE_COST_RENEWABLES
        renewable_weight = 0.4
    if ("minimiz" in text and "coste" in text) or "barato" in text or "económ" in text:
        objective = Objective.MINIMIZE_COST

    name = default_name or "Vehículo eléctrico"
    if "vehículo" in text or "coche" in text or "ve " in f" {text} ":
        name = "Vehículo eléctrico"
    elif "lavadora" in text:
        name = "Lavadora"
    elif "secadora" in text:
        name = "Secadora"

    load = LoadSpec(
        id="load-1",
        name=name,
        energy_kwh=energy_kwh,
        max_power_kw=max_power_kw,
        window_start=now,
        deadline=deadline,
        must_run="sin interrup" in text or "continua" in text,
    )
    prefs = OptimizationPreferences(objective=objective, renewable_weight=renewable_weight)
    explanation = (
        f"Interpretado: {energy_kwh} kWh antes de {deadline.strftime('%H:%M')} "
        f"({settings.timezone}), objetivo {objective.value}."
    )
    return ParsedIntent(loads=[load], preferences=prefs, explanation=explanation, confidence="rule_based")


def _parse_deadline(text: str, now: datetime, tz: ZoneInfo) -> datetime:
    scrubbed = re.sub(r"\d+(?:[.,]\d+)?\s*kwh", " ", text, flags=re.I)
    scrubbed = re.sub(r"\d+(?:[.,]\d+)?\s*kw\b", " ", scrubbed, flags=re.I)
    match = re.search(
        r"(?:antes de las|para las|a las|before)\s*(\d{1,2})(?::(\d{2}))?\s*(?:de la mañana|am|a\.m\.)?",
        scrubbed,
        flags=re.I,
    )
    if not match:
        match = re.search(
            r"(?:antes de las|para las|a las|before)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:de la mañana|am|a\.m\.)?",
            scrubbed,
            flags=re.I,
        )
    if not match and "mañana" in scrubbed:
        match = re.search(r"(\d{1,2})(?::(\d{2}))?", scrubbed)
    hour = int(match.group(1)) if match else 7
    minute = int(match.group(2) or 0)
    if match and ("tarde" in text or "pm" in text or "p.m." in text) and hour < 12:
        hour += 12
    if match and ("mañana" in text or "am" in text or "de la mañana" in text) and hour == 12:
        hour = 0

    deadline = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if deadline <= now:
        deadline += timedelta(days=1)
    return deadline
