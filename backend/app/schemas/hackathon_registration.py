
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


RegistrationStatus = Literal[
    "PENDING",
    "CONFIRMED",
    "WAITLISTED",
    "REJECTED",
]

PaymentStatus = Literal[
    "PENDING",
    "PAID",
    "FREE",
]


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    email: str
    department: str | None = None
    year: int | None = None
    student_id: str | None = None

    hackathon_id: UUID
    hackathon_name: str

    team_id: UUID | None = None
    team_name: str | None = None

    problem_statement_id: UUID | None = None
    problem_statement_title: str | None = None

    status: RegistrationStatus
    payment_status: PaymentStatus
    registered_at: datetime


class ParticipantStatusUpdate(BaseModel):
    status: RegistrationStatus
