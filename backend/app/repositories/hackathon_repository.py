from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon, HackathonStatus

from datetime import datetime, timezone

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

    def get_open_hackathons(
        self,
        db: Session,
    ) -> list[Hackathon]:
        statement = (
            select(Hackathon)
            .where(
                Hackathon.status.in_(
                    [
                        HackathonStatus.OPEN,
                        HackathonStatus.LIVE,
                    ]
                )
            )
            .order_by(Hackathon.event_start.asc())
        )

        return list(db.scalars(statement).all())

    

    def update(self, db: Session, hackathon: Hackathon) -> Hackathon:
        db.commit()
        db.refresh(hackathon)
        return hackathon

    def delete(self, db: Session, hackathon: Hackathon) -> None:
        db.delete(hackathon)
        db.commit()

    def sync_event_statuses(
    self,
    db: Session,
    ) -> None:
        now = datetime.now(timezone.utc)

        statement = (
            select(Hackathon)
            .where(
                Hackathon.status.in_(
                    [
                        HackathonStatus.OPEN,
                        HackathonStatus.LIVE,
                    ]
                )
            )
        )

        hackathons = list(db.scalars(statement).all())

        changed = False

        for hackathon in hackathons:
            if now >= hackathon.event_end:
                if hackathon.status != HackathonStatus.ENDED:
                    hackathon.status = HackathonStatus.ENDED
                    changed = True

            elif now >= hackathon.event_start:
                if hackathon.status == HackathonStatus.OPEN:
                    hackathon.status = HackathonStatus.LIVE
                    changed = True

        if changed:
            db.commit()