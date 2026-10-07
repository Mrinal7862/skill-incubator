from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=80)
    description: str | None = Field(default=None, max_length=300)
    max_members: int = Field(default=4, ge=2, le=6)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Team name must contain at least 3 characters")
        return value 

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

class TeamJoinRequest(BaseModel):
    join_code: str = Field(..., min_length=3, max_length=16)

    @field_validator("join_code")
    @classmethod
    def clean_join_code(cls, value: str)->str:
        value = value.strip().upper()
        if not value:
            raise ValueError("A team join code is required")
        return value

class TeamMemberResponse(BaseModel):
    user_id: UUID
    name: str
    email: str
    avatar_url: str | None = None
    role : str
    joined_at: datetime

class TeamResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    join_code: str
    owner_id: UUID
    max_members: int
    member_count: int
    is_owner: bool
    created_at: datetime
    members: list[TeamMemberResponse]