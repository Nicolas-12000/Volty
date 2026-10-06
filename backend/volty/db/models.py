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
