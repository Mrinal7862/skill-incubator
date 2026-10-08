from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Revision identifiers used by Alembic.
revision: str = "d3bfd0f2cad4"
down_revision: Union[str, Sequence[str], None] = "6e5c3b921fe6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create submissions table
    op.create_table(
        "submissions",

        sa.Column(
            "id",
            sa.Uuid(),
            nullable=False,
        ),

        sa.Column(
            "hackathon_id",
            sa.Uuid(),
            nullable=False,
        ),

        sa.Column(
            "team_id",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "problem_statement_id",
            sa.UUID(),
            nullable=True,
        ),

        sa.Column(
            "submitted_by",
            sa.UUID(),
            nullable=False,
        ),

        sa.Column(
            "project_name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "tech_stack",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "github_url",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "demo_url",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.Enum(
                "SUBMITTED",
                "UNDER_REVIEW",
                "ACCEPTED",
                "NEEDS_CHANGES",
                name="submissionstatus",
            ),
            nullable=False,
        ),

        sa.Column(
            "feedback",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),

        # Foreign Keys
        sa.ForeignKeyConstraint(
            ["hackathon_id"],
            ["hackathons.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["problem_statement_id"],
            ["problem_statements.id"],
            ondelete="SET NULL",
        ),

        sa.ForeignKeyConstraint(
            ["submitted_by"],
            ["users.id"],
            ondelete="CASCADE",
        ),

        # Primary Key
        sa.PrimaryKeyConstraint("id"),

        # One submission per team per hackathon
        sa.UniqueConstraint(
            "hackathon_id",
            "team_id",
            name="uq_submission_hackathon_team",
        ),
    )

    # Indexes
    op.create_index(
        op.f("ix_submissions_hackathon_id"),
        "submissions",
        ["hackathon_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_submissions_team_id"),
        "submissions",
        ["team_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_submissions_problem_statement_id"),
        "submissions",
        ["problem_statement_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_submissions_submitted_by"),
        "submissions",
        ["submitted_by"],
        unique=False,
    )

    op.create_index(
        op.f("ix_submissions_status"),
        "submissions",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    # Remove indexes
    op.drop_index(
        op.f("ix_submissions_status"),
        table_name="submissions",
    )

    op.drop_index(
        op.f("ix_submissions_submitted_by"),
        table_name="submissions",
    )

    op.drop_index(
        op.f("ix_submissions_problem_statement_id"),
        table_name="submissions",
    )

    op.drop_index(
        op.f("ix_submissions_team_id"),
        table_name="submissions",
    )

    op.drop_index(
        op.f("ix_submissions_hackathon_id"),
        table_name="submissions",
    )

    # Remove table
    op.drop_table("submissions")