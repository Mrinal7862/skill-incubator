"""Add Clerk identity and support Clerk-based user profiles."""

from alembic import op
import sqlalchemy as sa


revision = "8c7a31f5d201"
down_revision = "37fe49394cc3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("clerk_user_id", sa.String(length=255), nullable=True),
    )

    op.create_index(
        "ix_users_clerk_user_id",
        "users",
        ["clerk_user_id"],
        unique=True,
    )

    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.Text(),
        nullable=True,
    )

    op.alter_column(
        "users",
        "year",
        existing_type=sa.Integer(),
        nullable=True,
    )

    op.alter_column(
        "users",
        "contact",
        existing_type=sa.String(length=20),
        nullable=True,
    )


def downgrade() -> None:
    # Downgrade may fail if Clerk accounts have NULL values in
    # fields that become NOT NULL again. Do not delete user data.
    op.alter_column(
        "users",
        "contact",
        existing_type=sa.String(length=20),
        nullable=False,
    )

    op.alter_column(
        "users",
        "year",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.drop_index("ix_users_clerk_user_id", table_name="users")
    op.drop_column("users", "clerk_user_id")