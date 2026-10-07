from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon
from app.repositories.hackathon_repository import HackathonRepository
from app.schemas.hackathon import HackathonCreate, HackathonUpdate
from app.models.hackathon import Hackathon, HackathonStatus

class HackathonService:

    def __init__(self):
        self.repository = HackathonRepository()

    def create_hackathon(
        self,
        db: Session,
        organizer_id: UUID,
        payload: HackathonCreate,
    ) -> Hackathon:
        hackathon = Hackathon(
            organizer_id=organizer_id,
            name=payload.name,
            description=payload.description,
            image_url=payload.image_url,
            min_team_size=payload.min_team_size,
            max_team_size=payload.max_team_size,
            registration_amount=payload.registration_amount,
            registration_start=payload.registration_start,
            registration_end=payload.registration_end,
            event_start=payload.event_start,
            event_end=payload.event_end,
        )
        return self.repository.create(db, hackathon)

    def get_hackathon(
        self,
        db: Session,
        hackathon_id: UUID,
    ) -> Hackathon:
        hackathon = self.repository.get_by_id(db, hackathon_id)

        if hackathon is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found",
            )

        return hackathon

    def get_open_hackathons(self, db: Session) -> list[Hackathon]:
        return self.repository.get_open_hackathons(db)

    def get_my_hackathons(
        self,
        db: Session,
        organizer_id: UUID,
    ) -> list[Hackathon]:
        return self.repository.get_by_organizer(db, organizer_id)
    
    def get_open_hackathons(
        self,
        db: Session,
    ) -> list[Hackathon]:
        return self.repository.get_open_hackathons(db)

    def update_hackathon(
        self,
        db: Session,
        organizer_id: UUID,
        hackathon_id: UUID,
        payload: HackathonUpdate,
    ) -> Hackathon:
        hackathon = self.get_hackathon(db, hackathon_id)

        if hackathon.organizer_id != organizer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this hackathon",
            )

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(hackathon, key, value)

        return self.repository.update(db, hackathon)

    def delete_hackathon(
        self,
        db: Session,
        organizer_id: UUID,
        hackathon_id: UUID,
    ) -> None:
        hackathon = self.get_hackathon(db, hackathon_id)

        if hackathon.organizer_id != organizer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this hackathon",
            )

        self.repository.delete(db, hackathon)

    def sync_event_statuses(
    self,
    db: Session,
    ) -> None:
        self.repository.sync_event_statuses(db)             