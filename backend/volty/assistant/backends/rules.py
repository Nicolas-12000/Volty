from __future__ import annotations

from volty.assistant.pipeline import format_reply, resolve_slots, turn_from_slots
from volty.assistant.state import AssistantTurn, ThreadState


class RulesAssistantBackend:
    name = "rules"

    def turn(
        self,
        state: ThreadState,
        *,
        rag_snippets: list[str],
        context_load_name: str | None,
        user_name: str | None = None,
        user_email: str | None = None,
    ) -> AssistantTurn:
        _ = (rag_snippets, user_name, user_email)
        slots = resolve_slots(state, context_load_name)
        return turn_from_slots(
            slots,
            no_intent_message="No pude armar el borrador. Prueba con kWh y hora límite.",
            reply_for_intent=lambda intent: format_reply(intent),
        )
