from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import httpx

from volty.config import settings
from volty.models.schemas import LoadSpec, NaturalLanguageRequest, Objective, OptimizationPreferences, ParsedIntent


def parse_natural_language(request: NaturalLanguageRequest) -> ParsedIntent:
    text = request.message.strip().lower()
    if not text:
        raise ValueError("Mensaje vacío.")

    llm_result = _try_openai_parse(request.message)
    if llm_result:
        return llm_result

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
    match = re.search(r"(?:antes de las|para las|a las|before)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:de la mañana|am|a\.m\.)?", text)
    if not match and "mañana" in text:
        match = re.search(r"(\d{1,2})(?::(\d{2}))?", text)
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


def _try_openai_parse(message: str) -> ParsedIntent | None:
    if not settings.openai_api_key:
        return None

    schema = {
        "type": "object",
        "properties": {
            "loads": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "name": {"type": "string"},
                        "energy_kwh": {"type": "number"},
                        "max_power_kw": {"type": "number"},
                        "window_start": {"type": ["string", "null"]},
                        "deadline": {"type": "string"},
                        "must_run": {"type": "boolean"},
                    },
                    "required": ["name", "energy_kwh", "deadline"],
                },
            },
            "preferences": {
                "type": "object",
                "properties": {
                    "objective": {"type": "string", "enum": ["minimize_cost", "balance_cost_renewables"]},
                    "renewable_weight": {"type": "number"},
                },
            },
            "explanation": {"type": "string"},
        },
        "required": ["loads", "preferences", "explanation"],
    }

    system = (
        "Conviertes peticiones en español sobre cargas eléctricas en JSON estructurado. "
        f"Zona horaria: {settings.timezone}. Fechas ISO 8601 con offset."
    )
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": message},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "volty_intent", "schema": schema},
        },
    }
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        loads = [LoadSpec.model_validate(item) for item in data["loads"]]
        prefs = OptimizationPreferences.model_validate(data.get("preferences", {}))
        return ParsedIntent(
            loads=loads,
            preferences=prefs,
            explanation=data.get("explanation", "Interpretado con IA."),
            confidence="llm",
        )
    except Exception:
        return None
