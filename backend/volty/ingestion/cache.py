from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.dialects.postgresql import insert

from volty.core.db.models import ApiCacheEntry, IngestedSnapshot
from volty.core.db.session import get_session_factory


class PostgresCacheStore:
    """Caché con TTL en PostgreSQL e histórico append-only."""

    def __init__(self, ttl_seconds: int, source: str = "external") -> None:
        self.ttl_seconds = ttl_seconds
        self.source = source

    def get(self, key: str) -> Any | None:
        with get_session_factory()() as session:
            row = session.get(ApiCacheEntry, key)
            if row is None:
                return None
            age = time.time() - row.stored_at.timestamp()
            if age > self.ttl_seconds:
                return None
            return row.payload

    def set(self, key: str, data: Any) -> None:
        now = datetime.now(timezone.utc)
        with get_session_factory()() as session:
            stmt = insert(ApiCacheEntry).values(cache_key=key, payload=data, stored_at=now)
            stmt = stmt.on_conflict_do_update(
                index_elements=[ApiCacheEntry.cache_key],
                set_={"payload": data, "stored_at": now},
            )
            session.execute(stmt)
            session.add(
                IngestedSnapshot(
                    source=self.source,
                    cache_key=key,
                    payload=data,
                    fetched_at=now,
                )
            )
            session.commit()
