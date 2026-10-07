from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (get_current_organizer, get_current_user)
from app.models.hackathon import HackathonStatus
from app.models.user import User, UserRole
from app.schemas.hackathon import (
    HackathonCreate,
    HackathonResponse,
    HackathonUpdate,
)


from app.services.hackathon_service import HackathonService


router = APIRouter(
    prefix="/hackathons",
    tags=["Hackathons"],
)

service = HackathonService()


@router.get("", response_model=list[HackathonResponse])
def list_open_hackathons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.sync_event_statuses(db)
    return service.get_open_hackathons(db)


@router.post(
    "",
    response_model=HackathonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_hackathon(
    payload: HackathonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    return service.create_hackathon(
        db=db,
        organizer_id=current_user.id,
        payload=payload,
    )


@router.get("/my", response_model=list[HackathonResponse])
def get_my_hackathons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    service.sync_event_statuses(db)
    return service.get_my_hackathons(
        db=db,
        organizer_id=current_user.id,
    )


@router.get("/{hackathon_id}", response_model=HackathonResponse)
def get_hackathon(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.sync_event_statuses(db)
    hackathon = service.get_hackathon(
        db=db,
        hackathon_id=hackathon_id,
    )

    if current_user.role == UserRole.ORGANIZER:
        if hackathon.organizer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this hackathon.",
            )
    elif hackathon.status in {
        HackathonStatus.DRAFT,
        HackathonStatus.CANCELLED,
    }:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found",
        )

    return hackathon


@router.put("/{hackathon_id}", response_model=HackathonResponse)
def update_hackathon(
    hackathon_id: UUID,
    payload: HackathonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    return service.update_hackathon(
        db=db,
        organizer_id=current_user.id,
        hackathon_id=hackathon_id,
        payload=payload,
    )


@router.delete(
    "/{hackathon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_hackathon(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    service.delete_hackathon(
        db=db,
        organizer_id=current_user.id,
        hackathon_id=hackathon_id,
    )
    return None