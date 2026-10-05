from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import  DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class HackathonStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    LIVE = "LIVE"
    ENDED = "ENDED"
    CANCELLED = "CANCELLED"

class Hackathon(Base):
    __tablename__ = "hackathons"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    organizer_id : Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=False)

    image_url: Mapped[str| None] = mapped_column(
        Text,
        nullable=False
    )

    min_team_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    max_team_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    registration_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable= False,
        default=0
    )

    registration_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    registration_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    event_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    event_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    status: Mapped[HackathonStatus] = mapped_column(
        default= HackathonStatus.DRAFT,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default = datetime.utcnow(),
        onupdate=datetime.utcnow(),
        nullable=False
    )

    organizer = relationship(
        "User",
        back_populates="hackathons"
    )