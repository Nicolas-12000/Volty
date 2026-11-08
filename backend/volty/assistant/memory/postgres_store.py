"""Persistencia de hilos MATIAS en PostgreSQL."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select

from volty.assistant.state import ThreadState
from volty.core.db.models import MatiasThread
from volty.core.db.session import get_session_factory
from volty.core.schemas import ChatMessage, ParsedIntent


def _row_to_state(row: MatiasThread) -> ThreadState:
    messages = [ChatMessage.model_validate(m) for m in (row.messages or [])]
    draft = ParsedIntent.model_validate(row.draft) if row.draft else None
    return ThreadState(
        thread_id=row.thread_id,
        owner_email=row.owner_email,
        title=row.title,
        messages=messages,
        draft=draft,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _state_payload(state: ThreadState) -> dict:
    return {
        "owner_email": state.owner_email or "",
        "title": state.title,
        "messages": [m.model_dump(mode="json") for m in state.messages],
        "draft": state.draft.model_dump(mode="json") if state.draft else None,
        "updated_at": state.updated_at or datetime.now(timezone.utc),
    }


class PostgresThreadStore:
    def get(self, thread_id: str) -> ThreadState | None:
        with get_session_factory()() as session:
            row = session.get(MatiasThread, thread_id)
            return _row_to_state(row) if row else None

    def get_for_owner(self, thread_id: str, owner_email: str) -> ThreadState | None:
        state = self.get(thread_id)
        if state is None or state.owner_email != owner_email:
            return None
        return state

    def save(self, state: ThreadState) -> None:
        state.updated_at = datetime.now(timezone.utc)
        payload = _state_payload(state)
        with get_session_factory()() as session:
            row = session.get(MatiasThread, state.thread_id)
            if row is None:
                row = MatiasThread(
                    thread_id=state.thread_id,
                    owner_email=payload["owner_email"],
                    title=payload["title"],
                    messages=payload["messages"],
                    draft=payload["draft"],
                    created_at=state.created_at or payload["updated_at"],
                    updated_at=payload["updated_at"],
                )
                session.add(row)
            else:
                row.owner_email = payload["owner_email"]
                row.title = payload["title"]
                row.messages = payload["messages"]
                row.draft = payload["draft"]
                row.updated_at = payload["updated_at"]
            session.commit()

    def delete(self, thread_id: str) -> None:
        with get_session_factory()() as session:
            row = session.get(MatiasThread, thread_id)
            if row is not None:
                session.delete(row)
                session.commit()

    def delete_for_owner(self, thread_id: str, owner_email: str) -> bool:
        state = self.get(thread_id)
        if state is None or state.owner_email != owner_email:
            return False
        self.delete(thread_id)
        return True

    def list_for_owner(self, owner_email: str) -> list[ThreadState]:
        with get_session_factory()() as session:
            stmt = (
                select(MatiasThread)
                .where(MatiasThread.owner_email == owner_email)
                .order_by(MatiasThread.updated_at.desc())
            )
            rows = session.scalars(stmt).all()
            return [_row_to_state(r) for r in rows]

    def create(self, owner_email: str, title: str = "Nueva conversación") -> ThreadState:
        now = datetime.now(timezone.utc)
        state = ThreadState(thread_id=str(uuid4()), owner_email=owner_email, title=title, created_at=now)
        self.save(state)
        return state
