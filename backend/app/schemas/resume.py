from typing import List, Optional
from pydantic import BaseModel

class SkillSchema(BaseModel):
    name: str
    category: Optional[str] = "Technical"

class EducationSchema(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    score: Optional[str] = None

class ExperienceSchema(BaseModel):
    company: str
    title: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class ProjectSchema(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    link: Optional[str] = None

class ResumeExtractionSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    professional_summary: Optional[str] = None
    skills: List[SkillSchema] = []
    educations: List[EducationSchema] = []
    experiences: List[ExperienceSchema] = []
    projects: List[ProjectSchema] = []

class ResumeResponse(BaseModel):
    id: str
    filename: str
    uploaded_at: str
    parsed_json: Optional[ResumeExtractionSchema] = None

    class Config:
        from_attributes = True
