
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon
from app.models.problem_statement import ProblemStatement
from app.models.user import User, UserRole
from app.repositories.problem_statement_repository import (
    ProblemStatementRepository,
)
from app.schemas.problem_statement import (
    ProblemStatementCreate,
    ProblemStatementUpdate,
)


def _require_organizer(current_user: User) -> None:
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer access required.",
        )


def _get_owned_hackathon(
    db: Session,
    hackathon_id: UUID,
    current_user: User,
) -> Hackathon:
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

    return hackathon


def _get_owned_problem_statement(
    db: Session,
    statement_id: UUID,
    current_user: User,
) -> ProblemStatement:
    _require_organizer(current_user)

    problem_statement = ProblemStatementRepository.get_by_id(
        db,
        statement_id,
    )

    if problem_statement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem statement not found.",
        )

    _get_owned_hackathon(
        db,
        problem_statement.hackathon_id,
        current_user,
    )

    return problem_statement


def get_problem_statements(
        db: Session,
        hackathon_id: UUID,
        current_user: User,
    ) -> list[ProblemStatement]:
        hackathon = db.get(Hackathon, hackathon_id)

        if hackathon is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found.",
            )

        return ProblemStatementRepository.get_by_hackathon(
            db,
            hackathon_id,
    )

def create_problem_statement(
    db: Session,
    hackathon_id: UUID,
    payload: ProblemStatementCreate,
    current_user: User,
) -> ProblemStatement:
    _get_owned_hackathon(db, hackathon_id, current_user)

    return ProblemStatementRepository.create(
        db,
        hackathon_id,
        payload,
    )


def update_problem_statement(
    db: Session,
    statement_id: UUID,
    payload: ProblemStatementUpdate,
    current_user: User,
) -> ProblemStatement:
    problem_statement = _get_owned_problem_statement(
        db,
        statement_id,
        current_user,
    )

    return ProblemStatementRepository.update(
        db,
        problem_statement,
        payload,
    )


def delete_problem_statement(
    db: Session,
    statement_id: UUID,
    current_user: User,
) -> None:
    problem_statement = _get_owned_problem_statement(
        db,
        statement_id,
        current_user,
    )

    ProblemStatementRepository.delete(db, problem_statement)
