"""Intent NL → JSON vía Gemini (opcional; reglas siguen siendo el fallback)."""

from __future__ import annotations

import json
import re

from volty.core.config import settings
from volty.core.schemas import LoadSpec, OptimizationPreferences, ParsedIntent
from volty.gemini.client import generate_content


def parse_intent_with_gemini(message: str) -> ParsedIntent | None:
    if not settings.gemini_api_key:
        return None

    system = (
        "Convierte peticiones en español sobre cargas eléctricas en un único objeto JSON. "
        f"Zona horaria: {settings.timezone}. deadline en ISO 8601. "
        "loads[] debe incluir TODAS las cargas mencionadas (10+ en un hogar es normal). "
        "Incluye aparatos del catálogo mental (coche, lavadora, móvil, PC…) y también "
        "cualquier electrodoméstico raro que nombre el usuario (pelapapas eléctrico, "
        "freidora, plancha, etc.) con name descriptivo en español. "
        "Si faltan kWh o kW, usa defaults conservadores (pequeños aparatos ~0,1–0,5 kWh y ≤1 kW; "
        "grandes según contexto). No omitas aparatos. "
        "Campos: loads[], preferences{objective, renewable_weight}, explanation. "
        "Responde SOLO JSON válido, sin markdown."
    )
    text = generate_content(
        system_instruction=system,
        contents=[{"role": "user", "parts": [{"text": message}]}],
        temperature=0.1,
        max_output_tokens=2400,
    )
    if not text:
        return None
    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        data = json.loads(raw)
        loads = [LoadSpec.model_validate(item) for item in data["loads"]]
        prefs = OptimizationPreferences.model_validate(data.get("preferences", {}))
        return ParsedIntent(
            loads=loads,
            preferences=prefs,
            explanation=data.get("explanation", "Interpretado con Gemini."),
            confidence="llm",
        )
    except (json.JSONDecodeError, KeyError, ValueError):
        return None
