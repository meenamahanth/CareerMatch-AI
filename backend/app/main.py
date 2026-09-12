from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Infosys AI Internship Application Agent API",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. In production, specify domains.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CareerMatch AI API"}

from app.api.routes import auth, profile, resume, matching, interview, document

app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])
app.include_router(profile.router, prefix=settings.API_V1_STR + "/profile", tags=["profile"])
app.include_router(resume.router, prefix=settings.API_V1_STR + "/resumes", tags=["resumes"])
app.include_router(matching.router, prefix=settings.API_V1_STR + "/matching", tags=["matching"])
app.include_router(interview.router, prefix=settings.API_V1_STR + "/interview", tags=["interview"])
app.include_router(document.router, prefix=settings.API_V1_STR + "/documents", tags=["documents"])
