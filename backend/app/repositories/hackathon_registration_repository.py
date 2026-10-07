
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon
from app.models.hackathon_registration import HackathonRegistration
from app.models.problem_statement import ProblemStatement
from app.models.team import Team
from app.models.user import User


class HackathonRegistrationRepository:

    @staticmethod
    def list_for_organizer(
        db: Session,
        organizer_id: UUID,
        hackathon_id: UUID | None = None,
    ):
        statement = (
            select(
                HackathonRegistration,
                User,
                Hackathon,
                Team,
                ProblemStatement,
            )
            .join(
                Hackathon,
                HackathonRegistration.hackathon_id == Hackathon.id,
            )
            .join(
                User,
                HackathonRegistration.user_id == User.id,
            )
            .outerjoin(
                Team,
                HackathonRegistration.team_id == Team.id,
            )
            .outerjoin(
                ProblemStatement,
                HackathonRegistration.problem_statement_id
                == ProblemStatement.id,
            )
            .where(Hackathon.organizer_id == organizer_id)
            .order_by(HackathonRegistration.registered_at.desc())
        )

        if hackathon_id is not None:
            statement = statement.where(
                HackathonRegistration.hackathon_id == hackathon_id
            )

        return db.execute(statement).all()

    @staticmethod
    def get_owned_registration(
        db: Session,
        registration_id: UUID,
        organizer_id: UUID,
    ) -> HackathonRegistration | None:
        statement = (
            select(HackathonRegistration)
            .join(
                Hackathon,
                HackathonRegistration.hackathon_id == Hackathon.id,
            )
            .where(
                HackathonRegistration.id == registration_id,
                Hackathon.organizer_id == organizer_id,
            )
        )

        return db.scalar(statement)

    @staticmethod
    def save(db: Session, registration: HackathonRegistration):
        db.add(registration)
        db.commit()
        db.refresh(registration)
        return registration
