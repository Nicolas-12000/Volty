from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field

from volty.core.schemas import ChatMessage, ParsedIntent


class ThreadState(BaseModel):
    thread_id: str = Field(default_factory=lambda: str(uuid4()))
    owner_email: str | None = None
    title: str = "Nueva conversación"
    messages: list[ChatMessage] = Field(default_factory=list)
    draft: ParsedIntent | None = None
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None


class AssistantTurn(BaseModel):
    reply: str
    intent: ParsedIntent | None = None
    assistant_message: ChatMessage | None = None
