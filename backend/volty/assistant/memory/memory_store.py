"""Memoria de hilos = caché de conversación por perfil (dev: RAM; prod: Postgres)."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from volty.assistant.ports import ThreadStore
from volty.assistant.state import ThreadState

_STORE: dict[str, ThreadState] = {}


class InMemoryThreadStore:
    def get(self, thread_id: str) -> ThreadState | None:
        return _STORE.get(thread_id)

    def get_for_owner(self, thread_id: str, owner_email: str) -> ThreadState | None:
        state = self.get(thread_id)
        if state is None or state.owner_email != owner_email:
            return None
        return state

    def save(self, state: ThreadState) -> None:
        state.updated_at = datetime.now(timezone.utc)
        _STORE[state.thread_id] = state

    def delete(self, thread_id: str) -> None:
        _STORE.pop(thread_id, None)

    def delete_for_owner(self, thread_id: str, owner_email: str) -> bool:
        state = self.get(thread_id)
        if state is None or state.owner_email != owner_email:
            return False
        self.delete(thread_id)
        return True

    def list_for_owner(self, owner_email: str) -> list[ThreadState]:
        items = [s for s in _STORE.values() if s.owner_email == owner_email]
        items.sort(key=lambda s: s.updated_at or s.created_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
        return items

    def create(self, owner_email: str, title: str = "Nueva conversación") -> ThreadState:
        state = ThreadState(thread_id=str(uuid4()), owner_email=owner_email, title=title)
        self.save(state)
        return state


_store: ThreadStore | None = None


def get_thread_store() -> ThreadStore:
    global _store
    if _store is not None:
        return _store

    from volty.core.config import settings
    from volty.core.db.session import check_database_connection

    mode = settings.matias_thread_store.lower()
    use_postgres = mode == "postgres" or (mode == "auto" and check_database_connection())
    if use_postgres:
        from volty.assistant.memory.postgres_store import PostgresThreadStore

        _store = PostgresThreadStore()
    else:
        _store = InMemoryThreadStore()
    return _store
