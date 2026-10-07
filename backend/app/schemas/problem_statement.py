
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


DifficultyLevel = Literal["Beginner", "Intermediate", "Advanced"]


class ProblemStatementBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    category: str = Field(default="General", min_length=2, max_length=100)
    difficulty: DifficultyLevel = "Intermediate"
    requirements: str | None = None
    expected_outcome: str | None = None

    @field_validator("title", "description", "category")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty.")

        return value


class ProblemStatementCreate(ProblemStatementBase):
    pass


class ProblemStatementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    difficulty: DifficultyLevel | None = None
    requirements: str | None = None
    expected_outcome: str | None = None

    @field_validator("title", "description", "category")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("This field cannot be empty.")

        return value


class ProblemStatementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hackathon_id: uuid.UUID
    title: str
    description: str
    category: str
    difficulty: str
    requirements: str | None
    expected_outcome: str | None
    created_at: datetime
    updated_at: datetime
