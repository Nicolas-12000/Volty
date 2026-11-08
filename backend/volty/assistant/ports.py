"""Contratos (puertos) — sustituibles sin tocar la API."""

from __future__ import annotations

from typing import Protocol

from volty.assistant.state import AssistantTurn, ThreadState


class ThreadStore(Protocol):
    def get(self, thread_id: str) -> ThreadState | None: ...

    def get_for_owner(self, thread_id: str, owner_email: str) -> ThreadState | None: ...

    def save(self, state: ThreadState) -> None: ...

    def delete(self, thread_id: str) -> None: ...

    def delete_for_owner(self, thread_id: str, owner_email: str) -> bool: ...

    def list_for_owner(self, owner_email: str) -> list[ThreadState]: ...

    def create(self, owner_email: str, title: str = "Nueva conversación") -> ThreadState: ...


class KnowledgeRetriever(Protocol):
    """RAG opcional: devuelve trozos de texto para inyectar en el prompt."""

    def retrieve(self, query: str, *, limit: int = 5) -> list[str]: ...


class AssistantBackend(Protocol):
    name: str

    def turn(
        self,
        state: ThreadState,
        *,
        rag_snippets: list[str],
        context_load_name: str | None,
        user_name: str | None = None,
        user_email: str | None = None,
    ) -> AssistantTurn: ...
