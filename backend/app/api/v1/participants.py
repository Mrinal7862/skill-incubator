
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.hackathon_registration import (
    ParticipantResponse,
    ParticipantStatusUpdate,
)
from app.services.hackathon_registration_service import (
    get_participants,
    update_participant_status,
)


router = APIRouter(tags=["Participants"])


@router.get(
    "/participants",
    response_model=list[ParticipantResponse],
)
def list_participants(
    hackathon_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_participants(
        db=db,
        current_user=current_user,
        hackathon_id=hackathon_id,
    )


@router.patch(
    "/participants/{registration_id}/status",
    response_model=ParticipantResponse,
)
def change_participant_status(
    registration_id: UUID,
    payload: ParticipantStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_participant_status(
        db=db,
        registration_id=registration_id,
        payload=payload,
        current_user=current_user,
    )
