import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db import models
from app.services.embedding_service import index_internship

models.Base.metadata.create_all(bind=engine)

DEMO_INTERNSHIPS = [
    {
        "title": "Data Science Intern",
        "company": "Infosys",
        "description": "Join our Data Science team to build predictive models and analyze large datasets.",
        "required_skills": "Python, Machine Learning, SQL",
        "preferred_skills": "Deep Learning, PyTorch",
        "location": "Bangalore",
        "work_mode": "Hybrid",
        "duration": "6 Months",
        "category": "Data Science"
    },
    {
        "title": "Backend Developer Intern",
        "company": "Tech Solutions",
        "description": "Help us build scalable REST APIs for our flagship product.",
        "required_skills": "Python, FastAPI, SQL",
        "preferred_skills": "Docker, AWS",
        "location": "Remote",
        "work_mode": "Remote",
        "duration": "3 Months",
        "category": "Software Engineering"
    },
    {
        "title": "Generative AI Intern",
        "company": "AI Innovations",
        "description": "Research and implement LLMs and RAG pipelines for enterprise solutions.",
        "required_skills": "Python, NLP, Prompt Engineering",
        "preferred_skills": "Langchain, Vector Databases",
        "location": "Pune",
        "work_mode": "On-site",
        "duration": "6 Months",
        "category": "Artificial Intelligence"
    },
    {
        "title": "Frontend Developer Intern",
        "company": "Creative UI",
        "description": "Design and implement beautiful responsive web applications.",
        "required_skills": "JavaScript, React, CSS",
        "preferred_skills": "TypeScript, Tailwind",
        "location": "Remote",
        "work_mode": "Remote",
        "duration": "3 Months",
        "category": "Software Engineering"
    },
    {
        "title": "Data Engineering Intern",
        "company": "BigData Corp",
        "description": "Build data pipelines and optimize data warehouse architectures.",
        "required_skills": "Python, SQL, ETL",
        "preferred_skills": "Spark, Kafka",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "duration": "6 Months",
        "category": "Data Engineering"
    }
]

def seed_db():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(models.Internship).count()
        if existing > 0:
            print("Database already seeded with internships.")
            return

        print("Seeding internships...")
        for item in DEMO_INTERNSHIPS:
            internship = models.Internship(**item)
            db.add(internship)
            db.commit()
            db.refresh(internship)
            
            # Create indexing text
            index_text = f"Title: {internship.title}. Company: {internship.company}. Description: {internship.description}. Requirements: {internship.required_skills}. Preferred: {internship.preferred_skills}"
            index_internship(str(internship.id), index_text, {"category": internship.category})
            print(f"Indexed: {internship.title}")
            
        print("Seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
