
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1 import hackathons
from app.api.v1.teams import router as teams_router
from app.api.v1.problem_statements import router as problem_statements_router
from app.api.v1.participants import router as participants_router

api_router = APIRouter(
    prefix="/api/v1",
)

api_router.include_router(auth_router)
api_router.include_router(hackathons.router)
api_router.include_router(teams_router)
api_router.include_router(problem_statements_router)
api_router.include_router(participants_router)