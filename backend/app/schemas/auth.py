from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole

class RegistrationRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=0,
    )

    role: UserRole  


    # student Fields
    student_id: str | None = None
    department: str | None = None
    year: int | None = None
    contact: str | None = None
    github_url : str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    toekn_type: str  = "bearer"
    role: UserRole