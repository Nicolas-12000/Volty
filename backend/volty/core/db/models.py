from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ApiCacheEntry(Base):
    __tablename__ = "api_cache_entries"

    cache_key: Mapped[str] = mapped_column(String(512), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    stored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class UserAccount(Base):
    __tablename__ = "user_accounts"

    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class MatiasThread(Base):
    """Hilos de chat MATIAS por usuario (mensajes + borrador en JSONB)."""

    __tablename__ = "matias_threads"

    thread_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    owner_email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="Nueva conversación")
    messages: Mapped[list] = mapped_column(JSONB, nullable=False, server_default="[]")
    draft: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class IngestedSnapshot(Base):
    """Copia append-only de respuestas externas para análisis histórico."""

    __tablename__ = "ingested_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    source: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    cache_key: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
