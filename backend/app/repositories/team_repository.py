
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.team import Team, TeamMember


class TeamRepository:

    def get_by_id(
        self,
        db: Session,
        team_id: UUID,
    ) -> Team | None:
        statement = (
            select(Team)
            .where(Team.id == team_id)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user)
            )
        )
        return db.scalar(statement)

    def get_by_join_code(
        self,
        db: Session,
        join_code: str,
    ) -> Team | None:
        statement = (
            select(Team)
            .where(func.upper(Team.join_code) == join_code.upper())
            .options(
                selectinload(Team.members).selectinload(TeamMember.user)
            )
        )
        return db.scalar(statement)

    def get_teams_for_user(
        self,
        db: Session,
        user_id: UUID,
    ) -> list[Team]:
        statement = (
            select(Team)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .where(TeamMember.user_id == user_id)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user)
            )
            .order_by(Team.created_at.desc())
        )

        return list(db.scalars(statement).unique().all())

    def get_membership(
        self,
        db: Session,
        team_id: UUID,
        user_id: UUID,
    ) -> TeamMember | None:
        statement = select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id,
        )
        return db.scalar(statement)

    def count_members(
        self,
        db: Session,
        team_id: UUID,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(TeamMember)
            .where(TeamMember.team_id == team_id)
        )
        return db.scalar(statement) or 0

    def create_team(
        self,
        db: Session,
        team: Team,
        owner_membership: TeamMember,
    ) -> Team:
        try:
            db.add(team)
            db.flush()

            owner_membership.team_id = team.id
            db.add(owner_membership)

            db.commit()
            db.refresh(team)

            created_team = self.get_by_id(db, team.id)
            if created_team is None:
                raise RuntimeError("Created team could not be retrieved.")

            return created_team

        except Exception:
            db.rollback()
            raise

    def add_member(
        self,
        db: Session,
        membership: TeamMember,
    ) -> TeamMember:
        try:
            db.add(membership)
            db.commit()
            db.refresh(membership)
            return membership
        except Exception:
            db.rollback()
            raise
