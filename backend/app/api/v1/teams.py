
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.team import (
    TeamCreate,
    TeamJoinRequest,
    TeamResponse,
)
from app.services.team_service import TeamService


router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
)

service = TeamService()


@router.post(
    "",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_team(
    payload: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a team and add its creator as the owner."""
    return service.create_team(
        db=db,
        current_user=current_user,
        payload=payload,
    )


@router.get(
    "/my",
    response_model=list[TeamResponse],
)
def get_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.get_my_teams(
        db=db,
        current_user=current_user,
    )


@router.post(
    "/join",
    response_model=TeamResponse,
)
def join_team(
    payload: TeamJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    return service.join_team(
        db=db,
        current_user=current_user,
        payload=payload,
    )
