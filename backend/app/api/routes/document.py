import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.core.config import settings
from app.db import models
from app.services.document_qa_agent import process_document, answer_document_question
from typing import Any
from pydantic import BaseModel

router = APIRouter()

class DocumentQuestion(BaseModel):
    question: str

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed for documents currently.")

    # Save to db
    document = models.Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=""
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"doc_{document.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    document.file_path = file_path
    db.commit()
    
    # Process & Index
    process_document(file_path, current_user.id, document.id)
    
    return {"success": True, "document_id": document.id}

@router.post("/{document_id}/ask")
def ask_document_question(
    document_id: str,
    payload: DocumentQuestion,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    doc = db.query(models.Document).filter(models.Document.id == document_id, models.Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    answer = answer_document_question(current_user.id, document_id, payload.question)
    return {"answer": answer}
