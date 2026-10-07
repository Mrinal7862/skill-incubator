from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon, HackathonStatus


class HackathonRepository:

    def create(self, db: Session, hackathon: Hackathon) -> Hackathon:
        db.add(hackathon)
        db.commit()
        db.refresh(hackathon)
        return hackathon

    def get_by_id(
        self,
        db: Session,
        hackathon_id: UUID,
    ) -> Hackathon | None:
        statement = select(Hackathon).where(
            Hackathon.id == hackathon_id
        )
        return db.scalar(statement)

    def get_by_organizer(
        self,
        db: Session,
        organizer_id: UUID,
    ) -> list[Hackathon]:
        statement = (
            select(Hackathon)
            .where(Hackathon.organizer_id == organizer_id)
            .order_by(Hackathon.created_at.desc())
        )
        return list(db.scalars(statement).all())

    def get_open_hackathons(self, db: Session) -> list[Hackathon]:
        """Return hackathons that organizers have published as OPEN."""
        statement = (
            select(Hackathon)
            .where(Hackathon.status == HackathonStatus.OPEN)
            .order_by(
                Hackathon.registration_start.asc(),
                Hackathon.created_at.desc(),
            )
        )
        return list(db.scalars(statement).all())

    def update(self, db: Session, hackathon: Hackathon) -> Hackathon:
        db.commit()
        db.refresh(hackathon)
        return hackathon

    def delete(self, db: Session, hackathon: Hackathon) -> None:
        db.delete(hackathon)
        db.commit()