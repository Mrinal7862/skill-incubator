from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    hackathon_id: UUID
    team_id: UUID
    problem_statement_id: UUID | None = None

    project_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )

    description: str = Field(
        ...,
        min_length=10,
    )

    tech_stack: list[str] = Field(
        default_factory=list,
    )

    github_url: str = Field(
        ...,
        min_length=1,
    )

    demo_url: str | None = None


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID

    hackathon_id: UUID
    team_id: UUID
    problem_statement_id: UUID | None

    submitted_by: UUID

    project_name: str
    description: str

    tech_stack: list[str]

    github_url: str
    demo_url: str | None

    status: SubmissionStatus

    feedback: str | None

    submitted_at: datetime
    updated_at: datetime


class OrganizerSubmissionResponse(BaseModel):
    """
    Extended submission response for organizers.
    Includes team and problem statement information.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    hackathon_id: UUID
    team_id: UUID
    problem_statement_id: UUID | None

    submitted_by: UUID

    project_name: str
    description: str

    tech_stack: list[str]

    github_url: str
    demo_url: str | None

    status: SubmissionStatus

    feedback: str | None

    submitted_at: datetime
    updated_at: datetime

    team_name: str
    members: list[str] = Field(
        default_factory=list,
    )

    problem_statement_name: str | None = None


class SubmissionReviewUpdate(BaseModel):
    status: SubmissionStatus
    feedback: str | None = None