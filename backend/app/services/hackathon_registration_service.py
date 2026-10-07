
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon
from app.models.hackathon_registration import HackathonRegistration
from app.models.user import User, UserRole
from app.repositories.hackathon_registration_repository import (
    HackathonRegistrationRepository,
)
from app.schemas.hackathon_registration import (
    ParticipantResponse,
    ParticipantStatusUpdate,
)


def _require_organizer(current_user: User) -> None:
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer access required.",
        )


def _verify_hackathon_access(
    db: Session,
    hackathon_id: UUID,
    current_user: User,
) -> None:
    _require_organizer(current_user)

    hackathon = db.get(Hackathon, hackathon_id)

    if hackathon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this hackathon.",
        )


def _row_to_participant(row) -> ParticipantResponse:
    registration, user, hackathon, team, problem = row

    return ParticipantResponse(
        id=registration.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        department=user.department,
        year=user.year,
        student_id=user.student_id,
        hackathon_id=hackathon.id,
        hackathon_name=hackathon.name,
        team_id=team.id if team else None,
        team_name=team.name if team else None,
        problem_statement_id=problem.id if problem else None,
        problem_statement_title=problem.title if problem else None,
        status=registration.status,
        payment_status=registration.payment_status,
        registered_at=registration.registered_at,
    )


def get_participants(
    db: Session,
    current_user: User,
    hackathon_id: UUID | None = None,
) -> list[ParticipantResponse]:
    _require_organizer(current_user)

    if hackathon_id is not None:
        _verify_hackathon_access(db, hackathon_id, current_user)

    rows = HackathonRegistrationRepository.list_for_organizer(
        db=db,
        organizer_id=current_user.id,
        hackathon_id=hackathon_id,
    )

    return [_row_to_participant(row) for row in rows]


def update_participant_status(
    db: Session,
    registration_id: UUID,
    payload: ParticipantStatusUpdate,
    current_user: User,
) -> ParticipantResponse:
    _require_organizer(current_user)

    registration = (
        HackathonRegistrationRepository.get_owned_registration(
            db=db,
            registration_id=registration_id,
            organizer_id=current_user.id,
        )
    )

    if registration is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found.",
        )

    registration.status = payload.status

    HackathonRegistrationRepository.save(db, registration)

    rows = HackathonRegistrationRepository.list_for_organizer(
        db=db,
        organizer_id=current_user.id,
        hackathon_id=registration.hackathon_id,
    )

    for row in rows:
        if row[0].id == registration.id:
            return _row_to_participant(row)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Updated registration could not be retrieved.",
    )
