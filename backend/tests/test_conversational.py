from volty.assistant.conversational import clarification_message, conversational_confirm
from volty.core.schemas import LoadSpec, OptimizationPreferences, ParsedIntent
from datetime import datetime, timezone


def _load() -> LoadSpec:
    return LoadSpec(
        name="Vehículo eléctrico",
        energy_kwh=59,
        max_power_kw=11,
        deadline=datetime(2026, 11, 11, 7, 0, tzinfo=timezone.utc),
    )


def test_clarification_varies_wording():
    from volty.assistant.state import ThreadState
    from volty.core.schemas import ChatMessage

    merged = "cargar coche antes de las 7"
    s0 = ThreadState(messages=[])
    s1 = ThreadState(messages=[ChatMessage(role="user", content="hola")])
    a = clarification_message(merged, s0)
    b = clarification_message(merged, s1)
    assert a is not None
    assert a != b


def test_conversational_confirm_no_technical_dump():
    text = conversational_confirm(
        ParsedIntent(
            loads=[_load()],
            preferences=OptimizationPreferences(),
            explanation="x",
            confidence="rule_based",
        )
    )
    assert "Interpretado" not in text
    assert "Borrador (" not in text
    assert "59" in text
