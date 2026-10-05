from datetime import datetime
from uuid import UUID 

from pydantic import BaseModel, Field, model_validator

from app.models.hackathon import HackathonStatus

class HackathonCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: str| None = None
    image_url: str | None = None

    min_team_size: int = Field(..., ge=1)
    max_team_size: int = Field(..., ge=1)

    registration_amount: float = Field(..., ge=0)

    registration_start:datetime
    registration_end: datetime

    event_start:datetime
    event_end: datetime

    @model_validator(mode="after")
    def validate_dates_and_team_size(self):
        if self.min_team_size >  self.max_team_size:
            raise ValueError("Minimum team size cannot be greater than maximum team")

        if self.registration_end <= self.registration_start:
            raise ValueError("Registration end must be after registration start")

        if self.event_end <= self.event_start:
            raise ValueError("Event end must be after event start")

        if self.event_start < self.registration_start:
            raise ValueError("Event start cannot be before registration start")

        if self.registration_end > self.event_start:
            raise ValueError("Registration must end before the event starts")

        return self

class HackathonUpdate(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=255)
    description: str | None = None
    image_url: str | None = None

    min_team_size: int | None = Field(None, ge=1)
    max_team_size: int | None = Field(None, ge=1)

    registration_amount: float | None = Field(None, ge=0)

    registration_start: datetime | None = None
    registration_end: datetime | None = None

    event_start: datetime | None = None
    event_end: datetime | None = None

    status: HackathonStatus | None = None


class HackathonResponse(BaseModel):
    id: UUID
    organizer_id: UUID

    name: str
    description: str | None
    image_url: str | None

    min_team_size: int
    max_team_size: int

    registration_amount: float

    registration_start: datetime
    registration_end: datetime

    event_start: datetime
    event_end: datetime

    status: HackathonStatus

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }