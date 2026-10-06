"""Initial PostgreSQL schema for API cache and ingest history."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "api_cache_entries",
        sa.Column("cache_key", sa.String(length=512), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("stored_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("cache_key"),
    )
    op.create_table(
        "ingested_snapshots",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("cache_key", sa.String(length=512), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ingested_snapshots_source", "ingested_snapshots", ["source"])
    op.create_index("ix_ingested_snapshots_cache_key", "ingested_snapshots", ["cache_key"])
    op.create_index("ix_ingested_snapshots_fetched_at", "ingested_snapshots", ["fetched_at"])


def downgrade() -> None:
    op.drop_index("ix_ingested_snapshots_fetched_at", table_name="ingested_snapshots")
    op.drop_index("ix_ingested_snapshots_cache_key", table_name="ingested_snapshots")
    op.drop_index("ix_ingested_snapshots_source", table_name="ingested_snapshots")
    op.drop_table("ingested_snapshots")
    op.drop_table("api_cache_entries")
