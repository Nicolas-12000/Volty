from volty.assistant.slots import extract_intent
from volty.assistant.state import ThreadState
from volty.assistant.load_merge import _load_family
from volty.core.schemas import ChatMessage


def test_extract_intent_keeps_more_than_two_devices() -> None:
    state = ThreadState(
        messages=[
            ChatMessage(role="user", content="Necesito cargar el coche 78 kwh antes de las 7"),
            ChatMessage(role="user", content="lavadora esta noche lo más barato"),
            ChatMessage(role="user", content="celular listo a las 6"),
            ChatMessage(role="user", content="pc 10 kwh antes de las 6"),
        ]
    )
    intent = extract_intent(state, None)
    families = {_load_family(load.name, load.id) for load in intent.loads}
    assert len(intent.loads) >= 4
    assert families >= {"coche", "lavadora", "movil", "pc"}
