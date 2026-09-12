from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    resumes = relationship("Resume", back_populates="user")
    documents = relationship("Document", back_populates="user")
    sessions = relationship("InterviewSession", back_populates="user")
    matches = relationship("Match", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True)
    full_name = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    headline = Column(String(255))
    summary = Column(Text)
    linkedin = Column(String(255))
    github = Column(String(255))
    portfolio = Column(String(255))
    preferred_roles = Column(String(255))
    preferred_locations = Column(String(255))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True) # Full structured snapshot
    is_active = Column(Boolean, default=True) # The latest active resume
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("ResumeEducation", back_populates="resume", cascade="all, delete-orphan")
    experiences = relationship("ResumeExperience", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("ResumeProject", back_populates="resume", cascade="all, delete-orphan")


class ResumeSkill(Base):
    __tablename__ = "resume_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"))
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True) # Technical, Soft, Language, etc.
    
    resume = relationship("Resume", back_populates="skills")


class ResumeEducation(Base):
    __tablename__ = "resume_educations"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"))
    institution = Column(String(255), nullable=False)
    degree = Column(String(255))
    field_of_study = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    score = Column(String(50)) # CGPA/Percentage
    
    resume = relationship("Resume", back_populates="educations")


class ResumeExperience(Base):
    __tablename__ = "resume_experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"))
    company = Column(String(255), nullable=False)
    title = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    description = Column(Text)
    
    resume = relationship("Resume", back_populates="experiences")


class ResumeProject(Base):
    __tablename__ = "resume_projects"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    technologies = Column(String(500))
    link = Column(String(255))
    
    resume = relationship("Resume", back_populates="projects")


class Internship(Base):
    __tablename__ = "internships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(String(500))
    preferred_skills = Column(String(500))
    location = Column(String(255))
    work_mode = Column(String(50)) # Remote, On-site, Hybrid
    duration = Column(String(100))
    category = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"))
    internship_id = Column(String(36), ForeignKey("internships.id"))
    similarity_score = Column(Float)
    eligibility_score = Column(Float)
    total_score = Column(Float)
    matched_skills = Column(Text)
    missing_skills = Column(Text)
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="matches")
    internship = relationship("Internship")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="documents")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"))
    target_role = Column(String(255))
    difficulty = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="sessions")
    messages = relationship("InterviewMessage", back_populates="session", cascade="all, delete-orphan", order_by="InterviewMessage.created_at")


class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), ForeignKey("interview_sessions.id"))
    role = Column(String(50)) # 'ai' or 'user'
    content = Column(Text, nullable=False)
    score = Column(Float, nullable=True) # If user answer, the evaluated score
    feedback = Column(Text, nullable=True) # If user answer, the evaluated feedback
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("InterviewSession", back_populates="messages")
