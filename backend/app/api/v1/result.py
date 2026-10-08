from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.hackathon import Hackathon
from app.models.result import HackathonResult
from app.models.submission import Submission
from app.models.team import Team, TeamMember
from app.models.user import User, UserRole
from app.schemas.result import (
    HackathonResultCreate,
    HackathonResultResponse,
    HackathonResultUpdate,
    PublicHackathonResult,
    ResultWinner,
)


router = APIRouter(
    prefix="/results",
    tags=["Results"],
)


# =========================================================
# HELPERS
# =========================================================

def require_organizer(current_user: User):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer access required.",
        )


def get_owned_hackathon(
    db: Session,
    hackathon_id: UUID,
    current_user: User,
):
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


def validate_winner_submissions(
    db: Session,
    hackathon_id: UUID,
    submission_ids: list[UUID | None],
):
    valid_ids = [
        submission_id
        for submission_id in submission_ids
        if submission_id
    ]

    if len(valid_ids) != len(set(valid_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The same submission cannot have multiple winning positions.",
        )

    if not valid_ids:
        return

    submissions = db.scalars(
        select(Submission).where(
            Submission.id.in_(valid_ids),
            Submission.hackathon_id == hackathon_id,
        )
    ).all()

    found_ids = {
        submission.id
        for submission in submissions
    }

    missing_ids = [
        str(submission_id)
        for submission_id in valid_ids
        if submission_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "One or more selected submissions do not belong "
                "to this hackathon."
            ),
        )


def build_winner(
    db: Session,
    submission_id: UUID | None,
    position: int,
):
    if submission_id is None:
        return None

    submission = db.get(Submission, submission_id)

    if submission is None:
        return None

    team = db.get(Team, submission.team_id)

    if team is None:
        return None

    members = db.scalars(
        select(TeamMember)
        .where(
            TeamMember.team_id == team.id
        )
        .order_by(
            TeamMember.joined_at.asc()
        )
    ).all()

    member_names = []

    for member in members:
        user = db.get(User, member.user_id)

        if user is None:
            continue

        # Use name if available.
        # Fall back to email if name is unavailable.
        name = getattr(user, "name", None)

        if name:
            member_names.append(name)
        else:
            email = getattr(user, "email", None)

            if email:
                member_names.append(email)

    return ResultWinner(
        position=position,
        submission_id=submission.id,
        team_id=team.id,
        team_name=team.name,
        project_name=submission.project_name,
        description=submission.description,
        members=member_names,
    )


def build_public_result(
    db: Session,
    result: HackathonResult,
):
    hackathon = db.get(
        Hackathon,
        result.hackathon_id,
    )

    if hackathon is None:
        return None

    return PublicHackathonResult(
        hackathon_id=hackathon.id,
        hackathon_name=hackathon.name,
        event_end=hackathon.event_end,
        first=build_winner(
            db,
            result.first_submission_id,
            1,
        ),
        second=build_winner(
            db,
            result.second_submission_id,
            2,
        ),
        third=build_winner(
            db,
            result.third_submission_id,
            3,
        ),
        published=result.published,
    )


# =========================================================
# ORGANIZER — CREATE RESULT
# =========================================================

@router.post(
    "",
    response_model=HackathonResultResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_result(
    payload: HackathonResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_organizer(current_user)

    hackathon = get_owned_hackathon(
        db,
        payload.hackathon_id,
        current_user,
    )

    existing_result = db.scalar(
        select(HackathonResult).where(
            HackathonResult.hackathon_id == hackathon.id
        )
    )

    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A result already exists for this hackathon.",
        )

    validate_winner_submissions(
        db,
        hackathon.id,
        [
            payload.first_submission_id,
            payload.second_submission_id,
            payload.third_submission_id,
        ],
    )

    result = HackathonResult(
        hackathon_id=hackathon.id,
        first_submission_id=payload.first_submission_id,
        second_submission_id=payload.second_submission_id,
        third_submission_id=payload.third_submission_id,
        published=False,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


# =========================================================
# ORGANIZER — UPDATE RESULT
# =========================================================

@router.patch(
    "/{result_id}",
    response_model=HackathonResultResponse,
)
def update_result(
    result_id: UUID,
    payload: HackathonResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_organizer(current_user)

    result = db.get(
        HackathonResult,
        result_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found.",
        )

    get_owned_hackathon(
        db,
        result.hackathon_id,
        current_user,
    )

    if result.published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Published results cannot be edited.",
        )

    validate_winner_submissions(
        db,
        result.hackathon_id,
        [
            payload.first_submission_id,
            payload.second_submission_id,
            payload.third_submission_id,
        ],
    )

    result.first_submission_id = payload.first_submission_id
    result.second_submission_id = payload.second_submission_id
    result.third_submission_id = payload.third_submission_id

    db.commit()
    db.refresh(result)

    return result


# =========================================================
# ORGANIZER — GET RESULT FOR HACKATHON
# =========================================================

@router.get(
    "/hackathon/{hackathon_id}",
    response_model=HackathonResultResponse,
)
def get_hackathon_result_for_organizer(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_organizer(current_user)

    get_owned_hackathon(
        db,
        hackathon_id,
        current_user,
    )

    result = db.scalar(
        select(HackathonResult).where(
            HackathonResult.hackathon_id == hackathon_id
        )
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No result has been created for this hackathon.",
        )

    return result


# =========================================================
# ORGANIZER — PUBLISH RESULT
# =========================================================

@router.post(
    "/{result_id}/publish",
    response_model=HackathonResultResponse,
)
def publish_result(
    result_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_organizer(current_user)

    result = db.get(
        HackathonResult,
        result_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found.",
        )

    get_owned_hackathon(
        db,
        result.hackathon_id,
        current_user,
    )

    if result.published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result is already published.",
        )

    if not any(
        [
            result.first_submission_id,
            result.second_submission_id,
            result.third_submission_id,
        ]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one winner must be selected before publishing.",
        )

    result.published = True

    db.commit()
    db.refresh(result)

    return result


# =========================================================
# STUDENT — GET ALL PUBLISHED RESULTS
# =========================================================

@router.get(
    "",
    response_model=list[PublicHackathonResult],
)
def get_published_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = db.scalars(
        select(HackathonResult)
        .join(
            Hackathon,
            Hackathon.id == HackathonResult.hackathon_id,
        )
        .where(
            HackathonResult.published.is_(True),
        )
        .order_by(
            Hackathon.event_end.desc(),
        )
    ).all()

    return [
        public_result
        for result in results
        if (
            public_result := build_public_result(
                db,
                result,
            )
        )
    ]


# =========================================================
# STUDENT — GET SINGLE PUBLISHED RESULT
# =========================================================

@router.get(
    "/{hackathon_id}/public",
    response_model=PublicHackathonResult,
)
def get_public_result(
    hackathon_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.scalar(
        select(HackathonResult).where(
            HackathonResult.hackathon_id == hackathon_id,
            HackathonResult.published.is_(True),
        )
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found or not published yet.",
        )

    public_result = build_public_result(
        db,
        result,
    )

    if public_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )

    return public_result