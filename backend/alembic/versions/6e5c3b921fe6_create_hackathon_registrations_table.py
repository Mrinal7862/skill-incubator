
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "6e5c3b921fe6"
down_revision: Union[str, Sequence[str], None] = "7fff35683636"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "hackathon_registrations",
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
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "team_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column(
            "problem_statement_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "payment_status",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "registered_at",
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
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["problem_statement_id"],
            ["problem_statements.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "hackathon_id",
            "user_id",
            name="uq_hackathon_registration_user",
        ),
    )

    op.create_index(
        "ix_hackathon_registrations_hackathon_id",
        "hackathon_registrations",
        ["hackathon_id"],
        unique=False,
    )
    op.create_index(
        "ix_hackathon_registrations_user_id",
        "hackathon_registrations",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_hackathon_registrations_team_id",
        "hackathon_registrations",
        ["team_id"],
        unique=False,
    )
    op.create_index(
        "ix_hackathon_registrations_problem_statement_id",
        "hackathon_registrations",
        ["problem_statement_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_hackathon_registrations_problem_statement_id",
        table_name="hackathon_registrations",
    )
    op.drop_index(
        "ix_hackathon_registrations_team_id",
        table_name="hackathon_registrations",
    )
    op.drop_index(
        "ix_hackathon_registrations_user_id",
        table_name="hackathon_registrations",
    )
    op.drop_index(
        "ix_hackathon_registrations_hackathon_id",
        table_name="hackathon_registrations",
    )
    op.drop_table("hackathon_registrations")
