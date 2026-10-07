
import secrets
import string
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.team import Team, TeamMember
from app.models.user import User, UserRole
from app.repositories.team_repository import TeamRepository
from app.schemas.team import (
    TeamCreate,
    TeamJoinRequest,
    TeamMemberResponse,
    TeamResponse,
)


class TeamService:
    def __init__(self):
        self.repository = TeamRepository()

    @staticmethod
    def _generate_join_code() -> str:
        alphabet = string.ascii_uppercase + string.digits
        code = "".join(secrets.choice(alphabet) for _ in range(6))
        return f"SI-{code}"

    @staticmethod
    def _ensure_student(user: User) -> None:
        if user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can create or join teams.",
            )

    @staticmethod
    def _to_response(
        team: Team,
        current_user_id: UUID,
    ) -> TeamResponse:
        members = [
            TeamMemberResponse(
                user_id=member.user_id,
                name=member.user.name,
                email=member.user.email,
                avatar_url=member.user.avatar_url,
                role=member.role,
                joined_at=member.joined_at,
            )
            for member in team.members
        ]

        return TeamResponse(
            id=team.id,
            name=team.name,
            description=team.description,
            join_code=team.join_code,
            owner_id=team.owner_id,
            max_members=team.max_members,
            member_count=len(members),
            is_owner=team.owner_id == current_user_id,
            created_at=team.created_at,
            members=members,
        )

    def create_team(
        self,
        db: Session,
        current_user: User,
        payload: TeamCreate,
    ) -> TeamResponse:
        self._ensure_student(current_user)

        # Retry if another request happens to generate the same join code.
        for _ in range(5):
            join_code = self._generate_join_code()

            if self.repository.get_by_join_code(db, join_code):
                continue

            team = Team(
                name=payload.name,
                description=payload.description,
                join_code=join_code,
                owner_id=current_user.id,
                max_members=payload.max_members,
            )

            owner_membership = TeamMember(
                user_id=current_user.id,
                role="OWNER",
            )

            try:
                created_team = self.repository.create_team(
                    db,
                    team,
                    owner_membership,
                )
                return self._to_response(created_team, current_user.id)

            except IntegrityError:
                # The repository rolls back a failed transaction.
                # Try another join code in case of a uniqueness collision.
                continue

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not generate a unique join code. Please try again.",
        )

    def get_my_teams(
        self,
        db: Session,
        current_user: User,
    ) -> list[TeamResponse]:
        self._ensure_student(current_user)

        teams = self.repository.get_teams_for_user(
            db,
            current_user.id,
        )

        return [
            self._to_response(team, current_user.id)
            for team in teams
        ]

    def join_team(
        self,
        db: Session,
        current_user: User,
        payload: TeamJoinRequest,
    ) -> TeamResponse:
        self._ensure_student(current_user)

        team = self.repository.get_by_join_code(
            db,
            payload.join_code,
        )

        if team is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid team join code.",
            )

        existing_membership = self.repository.get_membership(
            db,
            team.id,
            current_user.id,
        )

        if existing_membership is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already a member of this team.",
            )

        current_count = self.repository.count_members(db, team.id)

        if current_count >= team.max_members:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This team has reached its maximum member limit.",
            )

        membership = TeamMember(
            team_id=team.id,
            user_id=current_user.id,
            role="MEMBER",
        )

        try:
            self.repository.add_member(db, membership)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You may already belong to this team. Refresh and try again.",
            ) from exc

        updated_team = self.repository.get_by_id(db, team.id)

        if updated_team is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Team was joined, but its updated details could not be loaded.",
            )

        return self._to_response(updated_team, current_user.id)
