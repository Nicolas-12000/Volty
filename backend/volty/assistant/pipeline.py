"""Fases compartidas del turno MATIAS (alta cohesión; backends delgados)."""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass

from volty.assistant.security import sanitize_assistant_text
from volty.assistant.slots import extract_intent, friendly_summary, merged_context, needs_clarification
from volty.assistant.state import AssistantTurn, ThreadState
from volty.core.schemas import ChatMessage, ParsedIntent


@dataclass
class ResolvedSlots:
    clarify: str | None
    intent: ParsedIntent | None


def resolve_slots(state: ThreadState, context_load_name: str | None) -> ResolvedSlots:
    merged = merged_context(state)
    clarify = needs_clarification(merged)
    try:
        intent = extract_intent(state, context_load_name)
    except ValueError:
        if state.draft is not None:
            intent = state.draft
        elif clarify:
            return ResolvedSlots(clarify=clarify, intent=None)
        else:
            raise
    if clarify:
        if intent is not None and not re.search(r"\d+(?:[.,]\d+)?\s*kwh", merged, re.I):
            intent = None
        return ResolvedSlots(clarify=clarify, intent=intent)
    return ResolvedSlots(clarify=None, intent=intent)


def format_reply(intent: ParsedIntent, *, emphasize_draft: bool = False) -> str:
    prefix = "Borrador listo con tus últimos datos.\n\n" if emphasize_draft else ""
    return prefix + friendly_summary(intent)


def turn_from_slots(
    slots: ResolvedSlots,
    *,
    no_intent_message: str,
    reply_for_intent: Callable[[ParsedIntent], str],
) -> AssistantTurn:
    if slots.clarify:
        msg = sanitize_assistant_text(slots.clarify)
        return AssistantTurn(
            reply=msg,
            intent=slots.intent,
            assistant_message=ChatMessage(role="assistant", content=msg),
        )
    if slots.intent is None:
        msg = sanitize_assistant_text(no_intent_message)
        return AssistantTurn(reply=msg, intent=None, assistant_message=ChatMessage(role="assistant", content=msg))
    reply = sanitize_assistant_text(reply_for_intent(slots.intent))
    return AssistantTurn(
        reply=reply,
        intent=slots.intent,
        assistant_message=ChatMessage(role="assistant", content=reply),
    )
