from volty.assistant.engine import handle_chat, reset_thread
from volty.core.schemas import MatiasChatRequest

OWNER = "demo@volty.dev"


def test_matias_chat_parses_full_request() -> None:
    res = handle_chat(
        MatiasChatRequest(message="Cargar el coche 30 kWh antes de las 7 de la mañana minimizando coste"),
        owner_email=OWNER,
    )
    assert res.intent is not None
    assert res.intent.loads[0].energy_kwh == 30
    reset_thread(res.thread_id, OWNER)


def test_matias_chat_asks_for_kwh() -> None:
    res = handle_chat(
        MatiasChatRequest(message="Quiero cargar el coche antes de las 7"),
        owner_email=OWNER,
    )
    assert res.intent is None
    assert "kWh" in res.reply
    reset_thread(res.thread_id, OWNER)


def test_matias_multi_turn_memory() -> None:
    first = handle_chat(
        MatiasChatRequest(message="cargar el cohce antes de las 7 de la mañana"),
        owner_email=OWNER,
    )
    second = handle_chat(
        MatiasChatRequest(thread_id=first.thread_id, message="son 40 kwh"),
        owner_email=OWNER,
    )
    assert second.draft is not None
    assert second.draft.loads[0].energy_kwh == 40
    assert len(second.messages) >= 3
    reset_thread(first.thread_id, OWNER)
