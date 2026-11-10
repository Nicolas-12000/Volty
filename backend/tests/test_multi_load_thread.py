from volty.assistant.engine import handle_chat, reset_thread
from volty.assistant.slots import extract_intent
from volty.assistant.state import ThreadState
from volty.core.schemas import ChatMessage, MatiasChatRequest


OWNER = "demo@volty.dev"


def test_extract_accumulates_many_messages() -> None:
    state = ThreadState(
        messages=[
            ChatMessage(role="user", content="coche 78 kwh antes de las 7"),
            ChatMessage(role="user", content="lavadora en la noche"),
            ChatMessage(role="user", content="celular antes de dormir listo a las 6"),
            ChatMessage(role="user", content="pc de 10 kwh para antes de las 6"),
        ],
    )
    intent = extract_intent(state, None)
    assert intent is not None
    families = {load.name for load in intent.loads}
    assert "Vehículo eléctrico" in families
    assert "Lavadora" in families
    assert "Cargador móvil" in families
    assert "Ordenador / PC" in families
    by_name = {load.name: load for load in intent.loads}
    assert by_name["Ordenador / PC"].energy_kwh == 10
    assert by_name["Vehículo eléctrico"].energy_kwh == 78


def test_chat_thread_keeps_four_loads() -> None:
    first = handle_chat(
        MatiasChatRequest(message="coche 78 kwh antes de las 7 minimizar coste"),
        owner_email=OWNER,
    )
    second = handle_chat(
        MatiasChatRequest(thread_id=first.thread_id, message="lavadora esta noche"),
        owner_email=OWNER,
    )
    third = handle_chat(
        MatiasChatRequest(thread_id=first.thread_id, message="movil listo a las 6"),
        owner_email=OWNER,
    )
    fourth = handle_chat(
        MatiasChatRequest(thread_id=first.thread_id, message="pc 10 kwh antes de las 6"),
        owner_email=OWNER,
    )
    assert fourth.draft is not None
    assert len(fourth.draft.loads) >= 3
    names = {load.name for load in fourth.draft.loads}
    assert names & {"Ordenador / PC", "PC"}
    reset_thread(first.thread_id, OWNER)
