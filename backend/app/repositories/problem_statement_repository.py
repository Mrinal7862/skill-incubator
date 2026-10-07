from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session


from app.models.problem_statement import ProblemStatement
from app.schemas.problem_statement import (
    ProblemStatementCreate,
    ProblemStatementUpdate
)

class ProblemStatementRepository:
    @staticmethod
    def get_by_id(
        db: Session,
        statement_id: UUID,
    )->ProblemStatement | None:
        return db.get(ProblemStatement, statement_id)

    @staticmethod
    def get_by_hackathon(
        db: Session,
        hackathon_id: UUID
    )->list[ProblemStatement]:
        statement = (
            select(ProblemStatement)
            .where(ProblemStatement.hackathon_id == hackathon_id)
            .order_by(ProblemStatement.created_at.desc())
        )

        return list(db.scalars(statement).all())

    @staticmethod
    def create(
        db:Session,
        hackathon_id:UUID,
        payload:ProblemStatementCreate,
    )->ProblemStatement:
        problem_statement = ProblemStatement(
            hackathon_id = hackathon_id,
            **payload.model_dump(),
        )

        db.add(problem_statement)
        db.commit()
        db.refresh(problem_statement)

        return problem_statement

    @staticmethod
    def update(
        db: Session,
        problem_statement:ProblemStatement,
        payload: ProblemStatementUpdate,
    )-> ProblemStatement:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(problem_statement, field, value)

            db.commit()
            db.refresh(problem_statement)

            return problem_statement

    @staticmethod
    def delete(
        db: Session,
        problem_statement:ProblemStatement,
    )-> None:
        db.delete(problem_statement)
        db.commit()