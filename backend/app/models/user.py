import enum 
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    ORGANIZER = "ORGANIZER"

class User(Base):

    __tablename__ = "users"

    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False
    )


    # student info 
    student_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    year: Mapped[int | None]  = mapped_column(
        Integer, 
        nullable=False
    )

    contact: Mapped[str | None] = mapped_column(
        String(20),
        nullable=False
    )

    github_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    avatar_url: Mapped[str | None] = mapped_column(
        Text, 
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda:datetime.now(timezone.utc),
        nullable=False
    )

    department: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    hackathons = relationship(
    "Hackathon",
    back_populates="organizer",
    cascade="all, delete-orphan",
)