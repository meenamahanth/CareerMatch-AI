import google.generativeai as genai
from sqlalchemy.orm import Session
from app.db import models
from app.core.config import settings

def start_interview_session(db: Session, user_id: str, target_role: str, difficulty: str) -> models.InterviewSession:
    session = models.InterviewSession(
        user_id=user_id,
        target_role=target_role,
        difficulty=difficulty
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def evaluate_answer_and_generate_next(db: Session, session: models.InterviewSession, user_answer: str, resume: models.Resume):
    if not settings.LLM_API_KEY:
        return "Configure LLM_API_KEY to use the interview agent.", 0, ""

    genai.configure(api_key=settings.LLM_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    
    # Fetch history
    history = db.query(models.InterviewMessage).filter(
        models.InterviewMessage.session_id == session.id
    ).order_by(models.InterviewMessage.created_at).all()
    
    chat_history_str = ""
    for msg in history:
        chat_history_str += f"{msg.role.upper()}: {msg.content}\n"
        
    resume_text = resume.raw_text if resume else "No resume provided."
    
    prompt = f"""
    You are an expert technical interviewer at a top tech company.
    The candidate is applying for the role of '{session.target_role}' at '{session.difficulty}' difficulty.
    
    Candidate's Resume Context:
    {resume_text[:2000]} # Trim to avoid context limits
    
    Conversation History:
    {chat_history_str}
    
    The candidate just answered your previous question with:
    USER: "{user_answer}"
    
    Task 1: Evaluate the candidate's answer out of 10. Give concise constructive feedback (Strengths, Weaknesses, How to improve).
    Task 2: Ask the next relevant interview question. It could be technical or behavioral, grounded in their resume experience if possible.
    
    Format output EXACTLY as follows:
    SCORE: <number between 0-10>
    FEEDBACK: <your feedback string>
    NEXT_QUESTION: <your next question>
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Parse response
        score_line = [line for line in text.split("\n") if line.startswith("SCORE:")]
        feedback_line = [line for line in text.split("\n") if line.startswith("FEEDBACK:")]
        question_line = [line for line in text.split("\n") if line.startswith("NEXT_QUESTION:")]
        
        score = float(score_line[0].replace("SCORE:", "").strip()) if score_line else 0
        feedback = feedback_line[0].replace("FEEDBACK:", "").strip() if feedback_line else ""
        next_question = question_line[0].replace("NEXT_QUESTION:", "").strip() if question_line else "Could you elaborate more on your experience?"
        
        return next_question, score, feedback
    except Exception as e:
        print(f"Error in interview agent: {e}")
        return "We experienced an error. Let's try another question: What is your strongest technical skill?", 0, "Error evaluating previous answer."
