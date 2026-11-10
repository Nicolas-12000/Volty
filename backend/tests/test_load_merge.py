from datetime import datetime, timezone

from volty.assistant.load_merge import merge_load_specs, merge_parsed_intents
from volty.core.schemas import LoadSpec, OptimizationPreferences, ParsedIntent


def _load(name: str, kwh: float) -> LoadSpec:
    return LoadSpec(
        name=name,
        energy_kwh=kwh,
        max_power_kw=3.0,
        deadline=datetime(2026, 11, 10, 7, 0, tzinfo=timezone.utc),
    )


def test_merge_load_specs_keeps_distinct_appliances() -> None:
    merged = merge_load_specs(
        [_load("ACS", 4.5), _load("Coche eléctrico", 30.0)],
        [_load("Lavadora", 1.2)],
    )
    names = {item.name for item in merged}
    assert names == {"ACS", "Coche eléctrico", "Lavadora"}


def test_merge_parsed_intents_llm_single_load_does_not_replace_hogar() -> None:
    old = ParsedIntent(
        loads=[_load("Coche eléctrico", 70.0)],
        preferences=OptimizationPreferences(),
        explanation="coche",
        confidence="rule_based",
    )
    new = ParsedIntent(
        loads=[_load("Lavadora", 1.2)],
        preferences=OptimizationPreferences(),
        explanation="lavadora",
        confidence="llm",
    )
    out = merge_parsed_intents(old, new)
    assert len(out.loads) == 2
    names = {item.name for item in out.loads}
    assert names == {"Coche eléctrico", "Lavadora"}


def test_merge_parsed_intents_accumulates_turns() -> None:
    old = ParsedIntent(
        loads=[_load("ACS", 4.5)],
        preferences=OptimizationPreferences(),
        explanation="acs",
        confidence="rule_based",
    )
    new = ParsedIntent(
        loads=[_load("Coche eléctrico", 30.0)],
        preferences=OptimizationPreferences(),
        explanation="coche",
        confidence="rule_based",
    )
    out = merge_parsed_intents(old, new)
    assert len(out.loads) == 2
