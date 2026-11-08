"""Orquestador MATIAS — memoria por perfil + borrador en el hilo."""

from __future__ import annotations

from volty.assistant.backends.base import default_actions
from volty.assistant.backends.registry import get_assistant_backend
from volty.assistant.memory.memory_store import get_thread_store
from volty.assistant.ports import ThreadStore
from volty.assistant.rag.registry import get_retriever
from volty.assistant.security import (
    guard_user_message,
    refusal_for_injection,
    sanitize_assistant_text,
)
from volty.assistant.state import ThreadState
from volty.assistant.security import UserMessageGuard
from volty.core.schemas import (
    ChatMessage,
    MatiasAction,
    MatiasChatRequest,
    MatiasChatResponse,
    MatiasThreadListResponse,
    MatiasThreadResponse,
    MatiasThreadSummary,
    ParsedIntent,
)

_store: ThreadStore = get_thread_store()
_retriever = get_retriever()


class ThreadAccessError(PermissionError):
    pass


def _sync_messages(state: ThreadState, req: MatiasChatRequest) -> UserMessageGuard | None:
    if req.message:
        guard = guard_user_message(req.message)
        state.messages.append(ChatMessage(role="user", content=guard.text))
        if state.title == "Nueva conversación" and guard.text:
            state.title = guard.text[:56] + ("…" if len(guard.text) > 56 else "")
        return guard
    if req.messages:
        cleaned: list[ChatMessage] = []
        for m in req.messages:
            if m.role == "user":
                g = guard_user_message(m.content)
                cleaned.append(ChatMessage(role="user", content=g.text))
            else:
                cleaned.append(
                    ChatMessage(role="assistant", content=sanitize_assistant_text(m.content))
                )
        state.messages = cleaned
    return None


def _load_state(thread_id: str | None, owner_email: str) -> ThreadState:
    if not thread_id:
        return _store.create(owner_email)
    state = _store.get_for_owner(thread_id, owner_email)
    if state is not None:
        return state
    if _store.get(thread_id) is not None:
        raise ThreadAccessError("No tienes acceso a este chat.")
    raise ValueError("Hilo no encontrado. Crea un chat nuevo.")


def handle_chat(
    req: MatiasChatRequest,
    *,
    owner_email: str,
    user_name: str | None = None,
) -> MatiasChatResponse:
    state = _load_state(req.thread_id, owner_email)

    if req.draft is not None:
        state.draft = req.draft

    guard = _sync_messages(state, req)

    if guard is not None and guard.blocked:
        reply = sanitize_assistant_text(refusal_for_injection())
        state.messages.append(ChatMessage(role="assistant", content=reply))
        _store.save(state)
        return MatiasChatResponse(
            thread_id=state.thread_id,
            reply=reply,
            messages=state.messages,
            intent=state.draft,
            draft=state.draft,
            actions=default_actions(state.draft),
            backend="policy",
            rag_used=False,
        )

    if req.draft is not None and not req.message and not (req.messages and len(req.messages) > 0):
        _store.save(state)
        reply = sanitize_assistant_text(
            "Borrador actualizado en este chat. Revisa los valores y guarda en cargas cuando cuadre."
        )
        return MatiasChatResponse(
            thread_id=state.thread_id,
            reply=reply,
            messages=state.messages,
            intent=state.draft,
            draft=state.draft,
            actions=default_actions(state.draft),
            backend=get_assistant_backend().name,
            rag_used=False,
        )

    if not state.messages:
        raise ValueError("No hay mensajes en el hilo.")

    merged = " ".join(m.content for m in state.messages if m.role == "user")
    snippets = _retriever.retrieve(merged)

    backend = get_assistant_backend()
    turn = backend.turn(
        state,
        rag_snippets=snippets,
        context_load_name=req.context_load_name,
        user_name=user_name,
        user_email=owner_email,
    )

    if turn.assistant_message:
        turn.assistant_message.content = sanitize_assistant_text(turn.assistant_message.content)
        state.messages.append(turn.assistant_message)
    if turn.intent is not None:
        state.draft = turn.intent

    _store.save(state)

    draft = state.draft
    actions: list[MatiasAction] = default_actions(draft or turn.intent)

    return MatiasChatResponse(
        thread_id=state.thread_id,
        reply=sanitize_assistant_text(turn.reply),
        messages=state.messages,
        intent=turn.intent,
        draft=draft,
        actions=actions,
        backend=backend.name,
        rag_used=bool(snippets),
    )


def list_threads(owner_email: str) -> MatiasThreadListResponse:
    rows = _store.list_for_owner(owner_email)
    summaries = [
        MatiasThreadSummary(
            thread_id=s.thread_id,
            title=s.title,
            updated_at=s.updated_at,
            message_count=len(s.messages),
            has_draft=s.draft is not None,
        )
        for s in rows
    ]
    return MatiasThreadListResponse(threads=summaries)


def create_thread(owner_email: str) -> MatiasThreadResponse:
    state = _store.create(owner_email)
    return MatiasThreadResponse(thread_id=state.thread_id, title=state.title, messages=[], draft=None)


def get_thread(thread_id: str, owner_email: str) -> MatiasThreadResponse:
    state = _store.get_for_owner(thread_id, owner_email)
    if state is None:
        raise ValueError("Hilo no encontrado.")
    return MatiasThreadResponse(
        thread_id=state.thread_id,
        title=state.title,
        messages=state.messages,
        draft=state.draft,
    )


def update_draft(thread_id: str, owner_email: str, draft: ParsedIntent) -> ParsedIntent:
    state = _store.get_for_owner(thread_id, owner_email)
    if state is None:
        raise ValueError("Hilo no encontrado.")
    state.draft = draft
    _store.save(state)
    return draft


def reset_thread(thread_id: str, owner_email: str) -> None:
    if not _store.delete_for_owner(thread_id, owner_email):
        raise ValueError("Hilo no encontrado.")
