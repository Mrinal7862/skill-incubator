from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole

class RegistrationRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "clerk_user_id": current_user.clerk_user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
        "student_id": current_user.student_id,
        "department": current_user.department,
        "year": current_user.year,
        "contact": current_user.contact,
        "github_url": current_user.github_url,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
    }

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