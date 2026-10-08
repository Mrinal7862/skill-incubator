from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class HackathonResult(Base):
    __tablename__ = "hackathon_results"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    hackathon_id: Mapped[UUID] = mapped_column(
        ForeignKey("hackathons.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    first_submission_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="SET NULL"),
        nullable=True,
    )

    second_submission_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="SET NULL"),
        nullable=True,
    )

    third_submission_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="SET NULL"),
        nullable=True,
    )

    published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )