from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SubmissionStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ACCEPTED = "ACCEPTED"
    NEEDS_CHANGES = "NEEDS_CHANGES"


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    hackathon_id: Mapped[UUID] = mapped_column(
        ForeignKey("hackathons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    team_id: Mapped[UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    problem_statement_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("problem_statements.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    submitted_by: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    project_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    tech_stack: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )

    github_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    demo_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[SubmissionStatus] = mapped_column(
        nullable=False,
        default=SubmissionStatus.SUBMITTED,
        index=True,
    )

    feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint(
            "hackathon_id",
            "team_id",
            name="uq_submission_hackathon_team",
        ),
    )