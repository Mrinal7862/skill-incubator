import os
from functools import lru_cache
from urllib.parse import quote
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
import httpx
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import (
    InvalidTokenError,
    PyJWKClientConnectionError,
    PyJWKClientError,
)
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole


load_dotenv()

security = HTTPBearer(auto_error=False)


@lru_cache(maxsize=4)
def get_jwks_client(jwks_url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(jwks_url)


def verify_clerk_token(token: str) -> dict:
    issuer = os.getenv("CLERK_ISSUER")
    jwks_url = os.getenv("CLERK_JWKS_URL")

    if not issuer or not jwks_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clerk verification is not configured on the backend.",
        )

    try:
        signing_key = get_jwks_client(
            jwks_url
        ).get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"require": ["exp", "iat", "sub"]},
        )

        if not payload.get("sub"):
            raise InvalidTokenError("Missing subject")

        return payload

    except PyJWKClientConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach Clerk's public signing keys.",
        ) from exc

    except (InvalidTokenError, PyJWKClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Clerk session token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def fetch_clerk_profile(clerk_user_id: str) -> dict:
    secret_key = os.getenv("CLERK_SECRET_KEY")

    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clerk backend API is not configured.",
        )

    encoded_id = quote(clerk_user_id, safe="")
    url = f"https://api.clerk.com/v1/users/{encoded_id}"

    try:
        response = httpx.get(
            url,
            headers={"Authorization": f"Bearer {secret_key}"},
            timeout=10.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to contact Clerk to load the user profile.",
        ) from exc

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The Clerk user account could not be found.",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clerk could not provide the user profile.",
        )

    profile = response.json()
    primary_email_id = profile.get("primary_email_address_id")

    primary_email = next(
        (
            item
            for item in profile.get("email_addresses", [])
            if item.get("id") == primary_email_id
        ),
        None,
    )

    if not primary_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A primary email address is required to use this application.",
        )

    verification = primary_email.get("verification") or {}
    if verification.get("status") != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your primary email address before continuing.",
        )

    email = primary_email.get("email_address")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A verified email address is required.",
        )

    name = " ".join(
        part
        for part in (
            profile.get("first_name"),
            profile.get("last_name"),
        )
        if part
    ).strip()

    if not name:
        name = profile.get("username") or email.split("@")[0]

    return {
        "clerk_user_id": clerk_user_id,
        "name": name[:100],
        "email": email.strip().lower(),
        "avatar_url": profile.get("image_url"),
    }


def resolve_clerk_user(clerk_user_id: str, db: Session) -> User:
    user = db.scalar(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )

    if user is not None:
        return user

    # Load trusted profile data from Clerk, not from client-supplied fields.
    profile = fetch_clerk_profile(clerk_user_id)

    # Link an existing local account by verified email, preserving its role.
    user = db.scalar(
        select(User).where(
            func.lower(User.email) == profile["email"]
        )
    )

    if user is not None:
        if (
            user.clerk_user_id is not None
            and user.clerk_user_id != clerk_user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already linked to another Clerk account.",
            )

        user.clerk_user_id = clerk_user_id

        if not user.avatar_url:
            user.avatar_url = profile["avatar_url"]

    else:
        # New self-registered accounts always start as STUDENT.
        # Organizer access must be granted through a trusted admin process.
        user = User(
            clerk_user_id=clerk_user_id,
            name=profile["name"],
            email=profile["email"],
            password_hash=None,
            role=UserRole.STUDENT,
            year=None,
            contact=None,
            avatar_url=profile["avatar_url"],
        )
        db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The account could not be linked because of a database conflict.",
        ) from exc

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_clerk_token(credentials.credentials)
    clerk_user_id = payload["sub"]

    user = resolve_clerk_user(clerk_user_id, db)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled.",
        )

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_clerk_token(credentials.credentials)
    clerk_user_id = payload["sub"]

    # Read role only from the verified Clerk session token.
    metadata = payload.get("metadata")
    role_value = (
        metadata.get("role")
        if isinstance(metadata, dict)
        else None
    )

    # Only these application roles are supported.
    if role_value not in {
        UserRole.STUDENT.value,
        UserRole.ORGANIZER.value,
    }:
        role_value = UserRole.STUDENT.value

    user = resolve_clerk_user(clerk_user_id, db)

    # Synchronize the database role with the trusted Clerk claim.
    expected_role = UserRole(role_value)

    if user.role != expected_role:
        user.role = expected_role

        try:
            db.commit()
            db.refresh(user)
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not synchronize the account role.",
            ) from exc

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled.",
        )

    return user

def get_current_organizer(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer access required.",
        )

    return current_user