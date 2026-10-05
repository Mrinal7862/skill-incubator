from uuid import UUID 

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_organizer
from app.models.user import User
from app.schemas.hackathon import (
    HackathonUpdate,
    HackathonCreate,
    HackathonResponse  
)

from app.services.hackathon_service import HackathonService


router = APIRouter(
    prefix="/hackathons",
    tags=["Hackathons"],
)

service = HackathonService()

@router.post(
    "",
    response_model=HackathonResponse,
    status_code= status.HTTP_201_CREATED,
)
def create_hackathon(
    payload: HackathonCreate,
    db: Session = Depends(get_current_organizer),
    current_user:User=Depends(get_current_organizer),
):
    return service.create_hackathon(
        db = db,
        organizer_id=  current_user.id,
        payload=payload
    )

@router.get(
    "/my",
    response_model=list[HackathonResponse],
)
def get_my_hackathons(
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    return service.get_my_hackathons(
        db = db,
        organizer_id=current_user.id,
    )

@router.get(
    "/{hackathon_id}",
    response_model=HackathonResponse,
)
def get_hackathon(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    hackathon = service.get_hackathon(
        db= db,
        hackathon_id=hackathon_id,
    )

    if hackathon.organizer_id != current_user.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail="You don't have access to this hackathon."
        )

@router.put(
    "/{hackathon_id}",
    response_model=HackathonResponse,
)

def update_hackathon(
    hackathon_id: UUID,
    payload: HackathonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    return service.update_hackathon(
        db =db,
        organizer_id=current_user.id,
        hackathon_id=hackathon_id,
        payload=payload
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