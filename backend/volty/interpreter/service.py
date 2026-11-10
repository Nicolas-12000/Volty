from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from volty.core.config import settings
from volty.core.schemas import LoadSpec, NaturalLanguageRequest, Objective, OptimizationPreferences, ParsedIntent
from volty.gemini.intent import parse_intent_with_gemini


def _merge_intents(old: ParsedIntent, new: ParsedIntent) -> ParsedIntent:
    from volty.assistant.load_merge import merge_parsed_intents

    return merge_parsed_intents(old, new)

_ENERGY_RE = re.compile(r"(\d+(?:[.,]\d+)?)\s*kwh", re.I)
_POWER_RE = re.compile(r"(\d+(?:[.,]\d+)?)\s*kw(?!h)", re.I)
_DEADLINE_RE = re.compile(
    r"(?:antes de las|para las|a las|before)\s*(\d{1,2})(?::(\d{2}))?",
    re.I,
)
_CLOCK_RE = re.compile(r"\b(\d{1,2}):(\d{2})\b")
_VEHICLE_HINT = re.compile(
    r"\b(coche|vehiculo|vehículo|wallbox|auto electrico|cargar el coche)\b",
    re.I,
)
_ELECTRIC_NOUN = re.compile(
    r"\b((?:mi |el |la )?[a-záéíóúñ]{3,}(?:\s+[a-záéíóúñ]{3,})?)\s+electr(?:ico|ica)\b",
    re.I,
)

_MUST_RUN = (
    "sin interrup",
    "no puede pausar",
    "no pueda pausar",
    "no se puede pausar",
    "must run",
    "must_run",
    "sin pausa",
    "continua",
)


@dataclass(frozen=True)
class _Appliance:
    pattern: str
    name: str
    slug: str
    default_kw: float
    default_kwh: float


# Orden: el más específico gana en la misma posición (lavavajillas antes que nada, coche eléctrico antes que coche).
_APPLIANCES: tuple[_Appliance, ...] = (
    _Appliance(r"lavavajillas", "Lavavajillas", "lavavajillas", 1.8, 1.0),
    _Appliance(r"lavadora", "Lavadora", "lavadora", 2.2, 1.2),
    _Appliance(r"secadora", "Secadora", "secadora", 2.0, 2.5),
    _Appliance(r"bomba de calor|\bacs\b", "Bomba de calor / ACS", "acs", 3.0, 4.5),
    _Appliance(
        r"\b(movil|móvil|celular|smartphone|telefono|teléfono)\b",
        "Cargador móvil",
        "movil",
        0.02,
        0.1,
    ),
    _Appliance(
        r"\b(ordenador|portatil|portatil|laptop|computadora|\bpc\b)",
        "Ordenador / PC",
        "pc",
        0.35,
        2.0,
    ),
    _Appliance(r"\b(tablet|ipad)\b", "Tablet", "tablet", 0.02, 0.05),
    _Appliance(r"\b(consola|playstation|xbox|nintendo|switch)\b", "Consola", "consola", 0.2, 0.15),
    _Appliance(r"\b(bicicleta electrica|e-bike|ebike)\b", "Bicicleta eléctrica", "ebike", 1.0, 0.5),
    _Appliance(r"\b(patinete electrico|scooter electrico)\b", "Patinete eléctrico", "patinete", 0.5, 0.3),
    _Appliance(r"\b(robot aspirador|roomba)\b", "Robot aspirador", "roomba", 0.1, 0.12),
    _Appliance(
        r"coche electrico|vehiculo electrico|\bcoche\b|\bvehiculo\b|\bwallbox\b",
        "Vehículo eléctrico",
        "coche",
        11.0,
        30.0,
    ),
)
_APPLIANCE_RE = re.compile("|".join(f"(?:{item.pattern})" for item in _APPLIANCES), re.I)


def parse_rules_intent(request: NaturalLanguageRequest) -> ParsedIntent:
    from volty.assistant.normalize import normalize_user_text

    raw = request.message.strip()
    if not raw:
        raise ValueError("Mensaje vacío.")
    return _rule_based_parse(_fold(normalize_user_text(raw)), request.context_load_name)


def parse_natural_language(request: NaturalLanguageRequest) -> ParsedIntent:
    rules = parse_rules_intent(request)
    raw = request.message.strip()
    explicit = bool(_ENERGY_RE.search(raw)) and bool(_POWER_RE.search(raw))
    if explicit and rules.loads:
        return rules
    gemini = parse_intent_with_gemini(raw)
    if gemini and gemini.loads:
        return _merge_intents(rules, gemini)
    return rules


def _guess_generic_name(text: str, default_name: str | None) -> str:
    if default_name and default_name != "Vehículo eléctrico":
        return default_name
    match = _ELECTRIC_NOUN.search(text)
    if match:
        phrase = match.group(0).strip()
        return phrase[:1].upper() + phrase[1:]
    token = re.search(r"\b(?:mi|el|la)\s+([a-záéíóúñ]{3,24})\b", text, re.I)
    if token and not _VEHICLE_HINT.search(token.group(1)):
        return token.group(1).strip().title()
    return "Carga flexible"


def rules_defaulted_to_vehicle(intent: ParsedIntent, line: str) -> bool:
    if len(intent.loads) != 1:
        return False
    if intent.loads[0].name != "Vehículo eléctrico":
        return False
    return not _VEHICLE_HINT.search(line) and bool(_ENERGY_RE.search(line) or _ELECTRIC_NOUN.search(line))


def parse_line_intent(line: str, context_load_name: str | None = None) -> ParsedIntent:
    """Un mensaje del hilo: reglas primero; Gemini si parece aparato fuera de catálogo."""
    request = NaturalLanguageRequest(message=line, context_load_name=context_load_name)
    rules = parse_rules_intent(request)
    need_llm = rules_defaulted_to_vehicle(rules, line) or (
        len(rules.loads) == 1 and rules.loads[0].name == "Carga flexible" and _ENERGY_RE.search(line)
    )
    if need_llm:
        gemini = parse_intent_with_gemini(line.strip())
        if gemini and gemini.loads:
            return _merge_intents(rules, gemini)
    return rules


def _fold(text: str) -> str:
    folded = unicodedata.normalize("NFKD", text.lower())
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", folded).strip()


def _rule_based_parse(text: str, default_name: str | None) -> ParsedIntent:
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    prefs = _preferences(text)
    matches = list(_APPLIANCE_RE.finditer(text))
    if not matches:
        if _VEHICLE_HINT.search(text):
            load = _single_load(text, "Vehículo eléctrico", "coche", 11.0, now)
            return _intent([load], prefs)
        name = _guess_generic_name(text, default_name)
        slug = re.sub(r"[^a-z0-9]+", "-", _fold(name)).strip("-") or "carga-flex"
        default_kw = min(2.0, _default_kw_for_name(name, 1.5))
        load = _single_load(text, name, slug[:24], default_kw, now)
        return _intent([load], prefs)

    energies = _floats(_ENERGY_RE, text)
    powers = _floats(_POWER_RE, text)
    deadlines = _deadlines(text, now)
    loads: list[LoadSpec] = []
    seen: dict[str, int] = {}
    for index, match in enumerate(matches):
        appliance = _appliance_for(match.group(0))
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        window = text[match.start() : end]
        if len(energies) == len(matches):
            energy = energies[index]
        else:
            found = _floats(_ENERGY_RE, window)
            if not found:
                if len(matches) == 1:
                    energy = energies[0] if energies else appliance.default_kwh
                else:
                    energy = appliance.default_kwh
            else:
                energy = found[0]
        if len(powers) == len(matches):
            power = powers[index]
        else:
            found_power = _floats(_POWER_RE, window)
            power = found_power[0] if found_power else appliance.default_kw
        if len(deadlines) == len(matches):
            deadline = deadlines[index]
        else:
            local = _deadlines(window, now)
            window_has_time = bool(
                _DEADLINE_RE.search(_scrub(window)) or _CLOCK_RE.search(_scrub(window))
            )
            if "esta noche" in window or "hoy por la noche" in window:
                deadline = now.replace(hour=23, minute=0, second=0, microsecond=0)
                if deadline <= now:
                    deadline = deadline.replace(hour=22, minute=0)
            elif window_has_time and local:
                deadline = local[0]
            elif len(matches) == 1 and deadlines:
                deadline = deadlines[0]
            else:
                deadline = _default_deadline(now)
        seen[appliance.slug] = seen.get(appliance.slug, 0) + 1
        suffix = "" if seen[appliance.slug] == 1 else f"-{seen[appliance.slug]}"
        loads.append(
            LoadSpec(
                id=f"{appliance.slug}{suffix}",
                name=appliance.name,
                energy_kwh=energy,
                max_power_kw=power,
                window_start=now,
                deadline=deadline,
                must_run=any(phrase in window for phrase in _MUST_RUN),
            )
        )
    if not loads:
        loads = [_single_load(text, default_name or "Vehículo eléctrico", "load-1", 11.0, now)]
    return _intent(loads, prefs)


def _default_energy_for_name(name: str) -> float:
    folded = name.lower()
    for item in _APPLIANCES:
        if item.slug in folded or item.name.lower() in folded:
            return item.default_kwh
    return 30.0


def _default_kw_for_name(name: str, fallback: float) -> float:
    folded = name.lower()
    for item in _APPLIANCES:
        if item.slug in folded or item.name.lower() in folded:
            return item.default_kw
    return fallback


def _single_load(
    text: str,
    name: str,
    load_id: str,
    default_kw: float,
    now: datetime,
) -> LoadSpec:
    energies = _floats(_ENERGY_RE, text)
    powers = _floats(_POWER_RE, text)
    deadlines = _deadlines(text, now)
    return LoadSpec(
        id=load_id,
        name=name,
        energy_kwh=energies[0] if energies else _default_energy_for_name(name),
        max_power_kw=powers[0] if powers else _default_kw_for_name(name, default_kw),
        window_start=now,
        deadline=deadlines[0],
        must_run=any(phrase in text for phrase in _MUST_RUN),
    )


def _intent(loads: list[LoadSpec], prefs: OptimizationPreferences) -> ParsedIntent:
    bits = [
        f"{load.name} {load.energy_kwh:g} kWh antes de {load.deadline.strftime('%H:%M')}"
        for load in loads
    ]
    explanation = (
        "Interpretado: "
        + "; ".join(bits)
        + f" ({settings.timezone}), objetivo {prefs.objective.value}."
    )
    return ParsedIntent(loads=loads, preferences=prefs, explanation=explanation, confidence="rule_based")


def _appliance_for(token: str) -> _Appliance:
    for item in _APPLIANCES:
        if re.search(item.pattern, token, flags=re.I):
            return item
    return _APPLIANCES[-1]


def _preferences(text: str) -> OptimizationPreferences:
    wants_green = any(word in text for word in ("renovable", "verde", "solar", "eolic", "equilibrio"))
    if wants_green:
        percent = re.search(r"(\d{1,3})\s*%", text)
        weight = min(1.0, int(percent.group(1)) / 100) if percent else 0.4
        return OptimizationPreferences(objective=Objective.BALANCE_COST_RENEWABLES, renewable_weight=weight)
    return OptimizationPreferences(objective=Objective.MINIMIZE_COST, renewable_weight=0.0)


def _floats(pattern: re.Pattern[str], text: str) -> list[float]:
    return [float(match.group(1).replace(",", ".")) for match in pattern.finditer(text)]


def _scrub(text: str) -> str:
    scrubbed = _ENERGY_RE.sub(" ", text)
    return _POWER_RE.sub(" ", scrubbed)


def _deadlines(text: str, now: datetime) -> list[datetime]:
    scrubbed = _scrub(text)
    found = [_deadline_from_match(match, scrubbed, now) for match in _DEADLINE_RE.finditer(scrubbed)]
    if found:
        return found
    clocks = [_deadline_from_match(match, scrubbed, now) for match in _CLOCK_RE.finditer(scrubbed)]
    if clocks:
        return clocks
    soft = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(?:de la manana|de la tarde)\b", scrubbed)
    if soft:
        return [_deadline_from_match(soft, scrubbed, now)]
    if any(p in scrubbed for p in ("antes de dormir", "por la noche", "esta noche", "de noche")):
        night = now.replace(hour=23, minute=0, second=0, microsecond=0)
        if night <= now:
            night = now.replace(hour=22, minute=30, second=0, microsecond=0)
        return [night]
    return [_default_deadline(now)]


def _deadline_from_match(match: re.Match[str], text: str, now: datetime) -> datetime:
    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    local = text[max(0, match.start() - 12) : match.end() + 24]
    if any(word in local for word in ("tarde", "pm", "p.m.")) and hour < 12:
        hour += 12
    if hour == 12 and any(word in local for word in ("manana", "am", "a.m.")):
        hour = 0
    hour = min(hour, 23)
    minute = min(minute, 59)
    deadline = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if deadline <= now:
        deadline += timedelta(days=1)
    return deadline


def _default_deadline(now: datetime) -> datetime:
    deadline = now.replace(hour=7, minute=0, second=0, microsecond=0)
    if deadline <= now:
        deadline += timedelta(days=1)
    return deadline

