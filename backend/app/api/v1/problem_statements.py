
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.problem_statement import (
    ProblemStatementCreate,
    ProblemStatementResponse,
    ProblemStatementUpdate,
)
from app.services import problem_statement_service


router = APIRouter(tags=["Problem Statements"])


@router.get(
    "/hackathons/{hackathon_id}/problem-statements",
    response_model=list[ProblemStatementResponse],
)
def list_problem_statements(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return problem_statement_service.get_problem_statements(
        db=db,
        hackathon_id=hackathon_id,
        current_user=current_user,
    )


@router.post(
    "/hackathons/{hackathon_id}/problem-statements",
    response_model=ProblemStatementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_problem_statement(
    hackathon_id: UUID,
    payload: ProblemStatementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return problem_statement_service.create_problem_statement(
        db=db,
        hackathon_id=hackathon_id,
        payload=payload,
        current_user=current_user,
    )


@router.put(
    "/problem-statements/{statement_id}",
    response_model=ProblemStatementResponse,
)
def update_problem_statement(
    statement_id: UUID,
    payload: ProblemStatementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return problem_statement_service.update_problem_statement(
        db=db,
        statement_id=statement_id,
        payload=payload,
        current_user=current_user,
    )


@router.delete(
    "/problem-statements/{statement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_problem_statement(
    statement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem_statement_service.delete_problem_statement(
        db=db,
        statement_id=statement_id,
        current_user=current_user,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
