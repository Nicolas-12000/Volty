"""MATIAS con Gemini: reglas para el borrador, Gemini solo para la respuesta natural."""

from __future__ import annotations

from volty.assistant.context import build_system_prompt
from volty.assistant.off_topic import off_topic_reply
from volty.assistant.pipeline import ResolvedSlots, format_reply, resolve_slots, turn_from_slots
from volty.assistant.security import wrap_user_content_for_model
from volty.assistant.state import AssistantTurn, ThreadState
from volty.core.schemas import ParsedIntent
from volty.gemini.client import generate_content


class GeminiAssistantBackend:
    name = "gemini"

    def turn(
        self,
        state: ThreadState,
        *,
        rag_snippets: list[str],
        context_load_name: str | None,
        user_name: str | None = None,
        user_email: str | None = None,
    ) -> AssistantTurn:
        _ = user_email
        last_user = next((m.content for m in reversed(state.messages) if m.role == "user"), "")
        redirect = off_topic_reply(last_user)
        if redirect:
            return turn_from_slots(
                ResolvedSlots(clarify=redirect, intent=None),
                no_intent_message="",
                reply_for_intent=lambda _: "",
            )

        slots = resolve_slots(state, context_load_name)

        def reply_for_intent(intent: ParsedIntent) -> str:
            natural = self._natural_reply(state, intent, rag_snippets, user_name=user_name)
            return natural or format_reply(intent, emphasize_draft=len(intent.loads) >= 2)

        return turn_from_slots(
            slots,
            no_intent_message="Todavía no tengo datos suficientes. Indica kWh y hora límite en este mismo chat.",
            reply_for_intent=reply_for_intent,
        )

    def _natural_reply(
        self,
        state: ThreadState,
        intent: ParsedIntent,
        rag_snippets: list[str],
        *,
        user_name: str | None,
    ) -> str | None:
        system = build_system_prompt(
            user_name=user_name,
            rag_snippets=rag_snippets,
            draft_json=intent.model_dump_json(),
        )
        contents: list[dict] = []
        for m in state.messages:
            role = "user" if m.role == "user" else "model"
            body = wrap_user_content_for_model(m.content) if role == "user" else m.content
            contents.append({"role": role, "parts": [{"text": body}]})
        if not contents:
            return None
        return generate_content(
            system_instruction=system,
            contents=contents,
            max_output_tokens=400,
            temperature=0.65,
        )
