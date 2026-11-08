"""MATIAS chat threads in PostgreSQL."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "matias_threads",
        sa.Column("thread_id", sa.String(length=36), nullable=False),
        sa.Column("owner_email", sa.String(length=320), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("messages", postgresql.JSONB(astext_type=sa.Text()), server_default="[]", nullable=False),
        sa.Column("draft", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("thread_id"),
    )
    op.create_index("ix_matias_threads_owner_email", "matias_threads", ["owner_email"])
    op.create_index(
        "ix_matias_threads_owner_updated",
        "matias_threads",
        ["owner_email", "updated_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_matias_threads_owner_updated", table_name="matias_threads")
    op.drop_index("ix_matias_threads_owner_email", table_name="matias_threads")
    op.drop_table("matias_threads")
