from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api import deps
from app.db import models
from app.services.interview_agent import start_interview_session, evaluate_answer_and_generate_next
from typing import Any
from pydantic import BaseModel

router = APIRouter()

class SessionStart(BaseModel):
    target_role: str
    difficulty: str

class AnswerPayload(BaseModel):
    answer: str

@router.post("/sessions")
def create_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: SessionStart,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    session = start_interview_session(db, current_user.id, session_in.target_role, session_in.difficulty)
    
    # Generate initial question
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id, models.Resume.is_active == True).first()
    first_q, _, _ = evaluate_answer_and_generate_next(db, session, "Hello, I am ready to start the interview.", resume)
    
    msg = models.InterviewMessage(
        session_id=session.id,
        role="ai",
        content=first_q
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    return {
        "session": {"id": session.id, "target_role": session.target_role, "difficulty": session.difficulty},
        "messages": [{"role": msg.role, "content": msg.content}]
    }
@router.post("/sessions/{session_id}/message")
def send_message(
    *,
    db: Session = Depends(deps.get_db),
    session_id: str,
    payload: AnswerPayload,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id, models.InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id, models.Resume.is_active == True).first()
    
    # Evaluate and get next
    next_q, score, feedback = evaluate_answer_and_generate_next(db, session, payload.answer, resume)
    
    # Save user answer with score
    user_msg = models.InterviewMessage(
        session_id=session.id,
        role="user",
        content=payload.answer,
        score=score,
        feedback=feedback
    )
    db.add(user_msg)
    
    # Save AI question
    ai_msg = models.InterviewMessage(
        session_id=session.id,
        role="ai",
        content=next_q
    )
    db.add(ai_msg)
    db.commit()
    
    
    # Return all messages for this session
    all_msgs = db.query(models.InterviewMessage).filter(models.InterviewMessage.session_id == session.id).order_by(models.InterviewMessage.created_at).all()
    
    return {
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "score": m.score,
                "feedback": m.feedback
            } for m in all_msgs
        ]
    }
