import os
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, cover_letter, profile, resume, career_assistant, interview_agent, voice_resume
from app.database import Base, engine
from app import models

app = FastAPI(
    title="Career Match AI API",
    description="Career Match AI resume intelligence, opportunity matching, and interview preparation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(
        origin.strip() for origin in os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", "http://localhost:5173")).split(",") if origin.strip()
    )),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(resume.router)
app.include_router(cover_letter.router)
app.include_router(career_assistant.router)
app.include_router(interview_agent.router)
app.include_router(voice_resume.router)

@app.on_event("startup")
def initialize_database():
    # Safe additive initialization: preserve existing tables and data.
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "postgresql":
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        for table in ("resumes", "interview_documents"):
            if table in inspector.get_table_names() and "file_data" not in {column["name"] for column in inspector.get_columns(table)}:
                with engine.begin() as connection:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN file_data BYTEA"))

@app.get("/")
def home():
    return {
        "message": "Career Match AI API is running",
        "status": "ok"
    }

@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}

@app.head("/health", include_in_schema=False)
def health_head():
    return Response(status_code=200)