
"""Create teams and team_members tables."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "b54d31e8a1c7"
down_revision = "8c7a31f5d201"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "teams",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("join_code", sa.String(length=16), nullable=False),
        sa.Column(
            "owner_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("max_members", sa.Integer(), nullable=False),
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
            ["owner_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_teams_join_code",
        "teams",
        ["join_code"],
        unique=True,
    )
    op.create_index(
        "ix_teams_owner_id",
        "teams",
        ["owner_id"],
        unique=False,
    )

    op.create_table(
        "team_members",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "team_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "team_id",
            "user_id",
            name="uq_team_members_team_user",
        ),
    )

    op.create_index(
        "ix_team_members_team_id",
        "team_members",
        ["team_id"],
        unique=False,
    )
    op.create_index(
        "ix_team_members_user_id",
        "team_members",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_team_members_user_id",
        table_name="team_members",
    )
    op.drop_index(
        "ix_team_members_team_id",
        table_name="team_members",
    )
    op.drop_table("team_members")

    op.drop_index("ix_teams_owner_id", table_name="teams")
    op.drop_index("ix_teams_join_code", table_name="teams")
    op.drop_table("teams")
