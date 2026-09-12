import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.core.config import settings
from app.db import models
from app.services.resume_parser import extract_text_from_pdf, parse_resume_with_llm
from app.schemas.resume import ResumeResponse

router = APIRouter()

os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/upload", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")

    # Save file
    file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract Text
    # For now, we only implement PDF extraction.
    text = extract_text_from_pdf(file_path) if file.filename.endswith(".pdf") else ""
    
    # Parse with LLM
    parsed_data = parse_resume_with_llm(text)
    
    # Deactivate previous active resumes
    db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id,
        models.Resume.is_active == True
    ).update({"is_active": False})
    
    # Save to database
    resume = models.Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=text,
        parsed_json=parsed_data.model_dump(),
        is_active=True
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    # Save structured entities (Skills, Ed, Exp)
    for skill in parsed_data.skills:
        db.add(models.ResumeSkill(resume_id=resume.id, name=skill.name, category=skill.category))
    for ed in parsed_data.educations:
        db.add(models.ResumeEducation(resume_id=resume.id, **ed.model_dump()))
    for exp in parsed_data.experiences:
        db.add(models.ResumeExperience(resume_id=resume.id, **exp.model_dump()))
    for proj in parsed_data.projects:
        db.add(models.ResumeProject(resume_id=resume.id, **proj.model_dump()))
        
    db.commit()
    
    # Also update profile if empty
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile:
        if not profile.full_name and parsed_data.full_name: profile.full_name = parsed_data.full_name
        if not profile.phone and parsed_data.phone: profile.phone = parsed_data.phone
        if not profile.linkedin and parsed_data.linkedin: profile.linkedin = parsed_data.linkedin
        if not profile.github and parsed_data.github: profile.github = parsed_data.github
        if not profile.summary and parsed_data.professional_summary: profile.summary = parsed_data.professional_summary
        db.add(profile)
        db.commit()

    return resume
