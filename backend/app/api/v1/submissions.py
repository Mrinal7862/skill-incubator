from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_organizer

from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.team import Team, TeamMember
from app.models.hackathon_registration import HackathonRegistration
from app.models.problem_statement import ProblemStatement
from app.models.submission import Submission, SubmissionStatus

from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    OrganizerSubmissionResponse,
    SubmissionReviewUpdate,
)


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"],
)


# CREATE SUBMISSION

@router.post(
    "",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_submission(
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Check hackathon

    hackathon = db.get(Hackathon, data.hackathon_id)

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )

    # 2. Check team

    team = db.get(Team, data.team_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    # 3. Check current user belongs to team
    # 

    team_membership = db.execute(
        select(TeamMember).where(
            TeamMember.team_id == data.team_id,
            TeamMember.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team.",
        )

    # 4. Check team registration in hackathon

    registration = db.execute(
        select(HackathonRegistration).where(
            HackathonRegistration.hackathon_id == data.hackathon_id,
            HackathonRegistration.team_id == data.team_id,
        )
    ).scalar_one_or_none()

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This team is not registered for this hackathon.",
        )

    # 5. Check problem statement

    if data.problem_statement_id:
        problem_statement = db.get(
            ProblemStatement,
            data.problem_statement_id,
        )

        if not problem_statement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Problem statement not found.",
            )

        if problem_statement.hackathon_id != data.hackathon_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Problem statement does not belong to this hackathon.",
            )

    # 6. Prevent duplicate submission

    existing_submission = db.execute(
        select(Submission).where(
            Submission.hackathon_id == data.hackathon_id,
            Submission.team_id == data.team_id,
        )
    ).scalar_one_or_none()

    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This team has already submitted a project for this hackathon.",
        )

    # 7. Create submission

    submission = Submission(
        hackathon_id=data.hackathon_id,
        team_id=data.team_id,
        problem_statement_id=data.problem_statement_id,
        submitted_by=current_user.id,
        project_name=data.project_name,
        description=data.description,
        tech_stack=data.tech_stack,
        github_url=data.github_url,
        demo_url=data.demo_url,
        status=SubmissionStatus.SUBMITTED,
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


# GET MY SUBMISSIONS

@router.get(
    "/my",
    response_model=list[SubmissionResponse],
)
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submissions = db.execute(
        select(Submission)
        .where(
            Submission.submitted_by == current_user.id
        )
        .order_by(
            Submission.submitted_at.desc()
        )
    ).scalars().all()

    return submissions


# ============================================================
# GET SINGLE SUBMISSION
# ============================================================

@router.get(
    "/{submission_id}",
    response_model=SubmissionResponse,
)
def get_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.get(
        Submission,
        submission_id,
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found.",
        )

    # --------------------------------------------------------
    # Student can see their own submission
    # --------------------------------------------------------

    if submission.submitted_by == current_user.id:
        return submission

    # --------------------------------------------------------
    # Team members can see team submission
    # --------------------------------------------------------

    is_team_member = db.execute(
        select(TeamMember).where(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if is_team_member:
        return submission

    # --------------------------------------------------------
    # Organizer of hackathon can see it
    # --------------------------------------------------------

    hackathon = db.get(
        Hackathon,
        submission.hackathon_id,
    )

    if hackathon and hackathon.organizer_id == current_user.id:
        return submission

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to view this submission.",
    )



# ORGANIZER - GET SUBMISSIONS
@router.get(
    "/organizer/all",
    response_model=list[OrganizerSubmissionResponse],
)
def get_organizer_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    submissions = db.execute(
        select(Submission)
        .join(
            Hackathon,
            Hackathon.id == Submission.hackathon_id,
        )
        .where(
            Hackathon.organizer_id == current_user.id
        )
        .order_by(
            Submission.submitted_at.desc()
        )
    ).scalars().all()

    results = []

    for submission in submissions:

        # ---------------------------------------------
        # Team
        # ---------------------------------------------

        team = db.get(
            Team,
            submission.team_id,
        )

        if not team:
            continue

        # ---------------------------------------------
        # Team members
        # ---------------------------------------------

        member_rows = db.execute(
            select(User)
            .join(
                TeamMember,
                TeamMember.user_id == User.id,
            )
            .where(
                TeamMember.team_id == team.id
            )
            .order_by(
                TeamMember.joined_at.asc()
            )
        ).scalars().all()

        members = []

        for member in member_rows:
            name = getattr(member, "name", None)

            if name:
                members.append(name)
            else:
                members.append(member.email)

        # ---------------------------------------------
        # Problem statement
        # ---------------------------------------------

        problem_statement_name = None

        if submission.problem_statement_id:
            problem_statement = db.get(
                ProblemStatement,
                submission.problem_statement_id,
            )

            if problem_statement:
                problem_statement_name = (
                    getattr(
                        problem_statement,
                        "title",
                        None,
                    )
                    or getattr(
                        problem_statement,
                        "name",
                        None,
                    )
                    or getattr(
                        problem_statement,
                        "problem_title",
                        None,
                    )
                )

        # ---------------------------------------------
        # Response
        # ---------------------------------------------

        results.append(
            OrganizerSubmissionResponse(
                id=submission.id,

                hackathon_id=submission.hackathon_id,
                team_id=submission.team_id,
                problem_statement_id=(
                    submission.problem_statement_id
                ),

                submitted_by=submission.submitted_by,

                project_name=submission.project_name,
                description=submission.description,

                tech_stack=submission.tech_stack,

                github_url=submission.github_url,
                demo_url=submission.demo_url,

                status=submission.status,
                feedback=submission.feedback,

                submitted_at=submission.submitted_at,
                updated_at=submission.updated_at,

                team_name=team.name,
                members=members,

                problem_statement_name=(
                    problem_statement_name
                ),
            )
        )

    return results

# ORGANIZER - REVIEW SUBMISSION


@router.patch(
    "/{submission_id}/review",
    response_model=SubmissionResponse,
)
def review_submission(
    submission_id: UUID,
    data: SubmissionReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer),
):
    submission = db.get(
        Submission,
        submission_id,
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found.",
        )


    # Check organizer owns hackathon
    

    hackathon = db.get(
        Hackathon,
        submission.hackathon_id,
    )

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review submissions from your own hackathons.",
        )

    # Update review
   

    submission.status = data.status
    submission.feedback = data.feedback

    db.commit()
    db.refresh(submission)

    return submission