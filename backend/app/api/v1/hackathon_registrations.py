from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_organizer

from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.hackathon_registration import HackathonRegistration
from app.models.team import Team, TeamMember
from app.models.problem_statement import ProblemStatement

from app.schemas.hackathon_registration import ParticipantResponse


router = APIRouter(tags=["Hackathon Registrations"])



# Request schema


class RegistrationCreate(BaseModel):
    hackathon_id: UUID
    team_id: UUID | None = None
    problem_statement_id: UUID | None = None



# Student Get my registrations


@router.get(
    "/registrations/me",
    response_model=list[ParticipantResponse],
)
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        select(
            HackathonRegistration,
            User,
            Hackathon,
            Team,
            ProblemStatement,
        )
        .join(
            User,
            User.id == HackathonRegistration.user_id,
        )
        .join(
            Hackathon,
            Hackathon.id == HackathonRegistration.hackathon_id,
        )
        .outerjoin(
            Team,
            Team.id == HackathonRegistration.team_id,
        )
        .outerjoin(
            ProblemStatement,
            ProblemStatement.id
            == HackathonRegistration.problem_statement_id,
        )
        .where(
            HackathonRegistration.user_id == current_user.id
        )
        .order_by(
            HackathonRegistration.registered_at.desc()
        )
    ).all()

    results = []

    for (
        registration,
        user,
        hackathon,
        team,
        problem_statement,
    ) in rows:
        results.append(
            ParticipantResponse(
                id=registration.id,
                user_id=registration.user_id,

                name=user.name,
                email=user.email,

                department=user.department,
                year=user.year,
                student_id=user.student_id,

                hackathon_id=hackathon.id,
                hackathon_name=hackathon.name,

                team_id=team.id if team else None,
                team_name=team.name if team else None,

                problem_statement_id=(
                    problem_statement.id
                    if problem_statement
                    else None
                ),

                problem_statement_title=(
                    problem_statement.title
                    if problem_statement
                    else None
                ),

                status=registration.status,
                payment_status=registration.payment_status,

                registered_at=registration.registered_at,
            )
        )

    return results

# Organizer - Get all participants from organizer's hackathons

@router.get(
    "/registrations/organizer",
    response_model=list[ParticipantResponse],
)
def get_organizer_participants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    rows = db.execute(
        select(
            HackathonRegistration,
            User,
            Hackathon,
            Team,
            ProblemStatement,
        )
        .join(
            User,
            User.id == HackathonRegistration.user_id,
        )
        .join(
            Hackathon,
            Hackathon.id == HackathonRegistration.hackathon_id,
        )
        .outerjoin(
            Team,
            Team.id == HackathonRegistration.team_id,
        )
        .outerjoin(
            ProblemStatement,
            ProblemStatement.id
            == HackathonRegistration.problem_statement_id,
        )
        .where(
            Hackathon.organizer_id == current_user.id
        )
        .order_by(
            HackathonRegistration.registered_at.desc()
        )
    ).all()

    results = []

    for (
        registration,
        user,
        hackathon,
        team,
        problem_statement,
    ) in rows:
        results.append(
            ParticipantResponse(
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

                problem_statement_id=(
                    problem_statement.id
                    if problem_statement
                    else None
                ),

                problem_statement_title=(
                    problem_statement.title
                    if problem_statement
                    else None
                ),

                status=registration.status,
                payment_status=registration.payment_status,

                registered_at=registration.registered_at,
            )
        )

    return results

# Register for a hackathon

@router.post(
    "/registrations",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_for_hackathon(
    payload: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    #Check hackathon exists
 

    hackathon = db.scalar(
        select(Hackathon).where(
            Hackathon.id == payload.hackathon_id
        )
    )

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )


#  Hackathon must be open for registration


    if str(hackathon.status.value if hasattr(hackathon.status, "value") else hackathon.status).upper() != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is not open for this hackathon.",
        )

    now = datetime.now(timezone.utc)

    registration_start = hackathon.registration_start
    registration_end = hackathon.registration_end

    if registration_start and now < registration_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has not started yet.",
        )

    if registration_end and now > registration_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed.",
        )

  
    # 3. Prevent duplicate registration
  

    existing_registration = db.scalar(
        select(HackathonRegistration).where(
            HackathonRegistration.hackathon_id
            == payload.hackathon_id,
            HackathonRegistration.user_id
            == current_user.id,
        )
    )

    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already registered for this hackathon.",
        )


# Resolve student's team


    team = None

    # Explicit team selected from frontend
    if payload.team_id:
        team = db.scalar(
            select(Team)
            .join(
                TeamMember,
                TeamMember.team_id == Team.id,
            )
            .where(
                Team.id == payload.team_id,
                TeamMember.user_id == current_user.id,
            )
        )

        if not team:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of the selected team.",
            )

    # No team selected → find student's teams automatically
    else:
        student_teams = list(
            db.scalars(
                select(Team)
                .join(
                    TeamMember,
                    TeamMember.team_id == Team.id,
                )
                .where(
                    TeamMember.user_id == current_user.id,
                )
                .order_by(Team.created_at.asc())
            ).all()
        )

        if len(student_teams) == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Please create a team first before registering "
                    "for this hackathon."
                ),
            )

        if len(student_teams) > 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "You are part of multiple teams. "
                    "Please select a team before registering."
                ),
            )

        team = student_teams[0]
    # --------------------------------------------------------
    # 5. Validate problem statement if provided
    # --------------------------------------------------------

    problem_statement = None

    if payload.problem_statement_id:
        problem_statement = db.scalar(
            select(ProblemStatement).where(
                ProblemStatement.id
                == payload.problem_statement_id,
                ProblemStatement.hackathon_id
                == payload.hackathon_id,
            )
        )

        if not problem_statement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Selected problem statement "
                    "does not belong to this hackathon."
                ),
            )

    # --------------------------------------------------------
    # 6. Payment status
    # --------------------------------------------------------

    payment_status = (
        "FREE"
        if float(hackathon.registration_amount or 0) == 0
        else "PENDING"
    )


    # 7. Create registration

    registration = HackathonRegistration(
        hackathon_id=payload.hackathon_id,
        user_id=current_user.id,
        team_id=team.id,
        problem_statement_id=payload.problem_statement_id,
        status="PENDING",
        payment_status=payment_status,
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    # --------------------------------------------------------
    # 8. Return complete registration
    # --------------------------------------------------------

    return ParticipantResponse(
        id=registration.id,
        user_id=registration.user_id,

        name=current_user.name,
        email=current_user.email,

        department=current_user.department,
        year=current_user.year,
        student_id=current_user.student_id,

        hackathon_id=hackathon.id,
        hackathon_name=hackathon.name,

        team_id=team.id if team else None,
        team_name=team.name if team else None,

        problem_statement_id=(
            problem_statement.id
            if problem_statement
            else None
        ),

        problem_statement_title=(
            problem_statement.title
            if problem_statement
            else None
        ),

        status=registration.status,
        payment_status=registration.payment_status,

        registered_at=registration.registered_at,
    )