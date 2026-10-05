from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.auth import (
    LoginRequest, 
    RegistrationRequest,
    TokenResponse
)

from app.services.auth_service import (
    login_user, 
    register_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    '/register',
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegistrationRequest,
    db: Session = Depends(get_db)
):

    try:
        user = register_user(
            db=db,
            data=data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    return {
        "message" : "Registration successful",
        "user":{
            "id": str(user.id),
            "name": user.name,
            "email":user.email,
            "role":user.role.value,
        },
    }

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db:Session = Depends(get_db)
):
    try:
        access_token = login_user(
            db=db,
            data=data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=data.role,
    )

@router.get(
    "/me",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id":str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
        "student_id": current_user.student_id,
        "department":current_user.department,
        "year": current_user.year,
        "contact": current_user.contact,
        "github_url": current_user.github_url,
        "is_active": current_user.is_active,
    }