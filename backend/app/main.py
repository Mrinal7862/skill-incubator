from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.api.router import api_router


app = FastAPI(
    title="Skill Incubator API" ,
    description="Backend API for Skill Incubator",
    version="0.1.0",    
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.CORS_ORIGINS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router
)


@app.get('/')
def root():
    return {
        "message":"Skill Incubator API is running"
    }

@app.get("/health")
def health():
    return {
        "status":"OK"
    }

@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {
        "status":"ok",
        "database":"connected",
    }