from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HackathonResultBase(BaseModel):
    hackathon_id: UUID

    first_submission_id: UUID | None = None
    second_submission_id: UUID | None = None
    third_submission_id: UUID | None = None


class HackathonResultCreate(HackathonResultBase):
    pass


class HackathonResultUpdate(BaseModel):
    first_submission_id: UUID | None = None
    second_submission_id: UUID | None = None
    third_submission_id: UUID | None = None


class HackathonResultResponse(HackathonResultBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    published: bool
    created_at: datetime
    updated_at: datetime



# PUBLIC RESULT SCHEMAS
# 

class ResultWinner(BaseModel):
    position: int

    submission_id: UUID
    team_id: UUID
    team_name: str

    project_name: str
    description: str | None = None

    members: list[str] = Field(default_factory=list)


class PublicHackathonResult(BaseModel):
    hackathon_id: UUID
    hackathon_name: str

    event_end: datetime | None = None

    first: ResultWinner | None = None
    second: ResultWinner | None = None
    third: ResultWinner | None = None

    published: bool