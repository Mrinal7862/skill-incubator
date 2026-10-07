
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "7fff35683636"
down_revision: Union[str, Sequence[str], None] = "b54d31e8a1c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "problem_statements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "hackathon_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=False,
            server_default="General",
        ),
        sa.Column(
            "difficulty",
            sa.String(length=20),
            nullable=False,
            server_default="Intermediate",
        ),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("expected_outcome", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["hackathon_id"],
            ["hackathons.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_problem_statements_hackathon_id",
        "problem_statements",
        ["hackathon_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_problem_statements_hackathon_id",
        table_name="problem_statements",
    )
    op.drop_table("problem_statements")
