from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.db import models
from app.services.matching_service import perform_matching
from typing import Any

router = APIRouter()

@router.post("/internships")
def match_internships(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Match candidate against internships using semantic search and structured filtering.
    """
    matches = perform_matching(db, current_user.id)
    if not matches:
        return {"success": True, "data": []}
    
    response_data = []
    for m in matches:
        internship = m["internship"]
        match_details = m["match_details"]
        response_data.append({
            "internship_id": internship.id,
            "title": internship.title,
            "company": internship.company,
            "location": internship.location,
            "work_mode": internship.work_mode,
            "similarity_score": match_details.similarity_score,
            "explanation": match_details.explanation,
            "matched_skills": match_details.matched_skills,
            "missing_skills": match_details.missing_skills
        })
        
    return {"success": True, "data": response_data}
