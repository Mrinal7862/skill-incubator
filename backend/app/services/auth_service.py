from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.models.user import User
from app.schemas.auth import LoginRequest, RegistrationRequest
from app.utils.enums import UserRole


def register_user(
    db: Session,
    data: RegistrationRequest,
) -> User:

    email = str(data.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise ValueError(
            "Account already exists!"
        )

    if data.role == UserRole.STUDENT and not data.student_id:
        raise ValueError(
            "Student ID is required for student registration"
        )

    hashed_password = hash_password(data.password)

    user = User(
        name=data.name,
        email=email,
        password_hash=hashed_password,
        role=data.role,
        student_id=data.student_id,
        department=data.department,
        year=data.year,
        contact=data.contact,
        github_url=data.github_url,
        avatar_url=data.avatar_url,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(
    db: Session,
    data: LoginRequest,
) -> str:

    email = str(data.email).strip().lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        raise ValueError(
            "No account found. Please register."
        )

    if not user.is_active:
        raise ValueError(
            "This account has been disabled."
        )

    if user.role != data.role:
        raise ValueError(
            "Incorrect login portal for this account."
        )

    password_valid = verify_password(
        data.password,
        user.password_hash,
    )

    if not password_valid:
        raise ValueError(
            "Invalid email or password"
        )

    access_token = create_access_token(
        str(user.id)
    )

    return access_token