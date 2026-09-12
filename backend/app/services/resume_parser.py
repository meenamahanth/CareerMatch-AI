import PyPDF2
import json
import google.generativeai as genai
from app.core.config import settings
from app.schemas.resume import ResumeExtractionSchema

if settings.LLM_API_KEY:
    genai.configure(api_key=settings.LLM_API_KEY)

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def parse_resume_with_llm(text: str) -> ResumeExtractionSchema:
    if not settings.LLM_API_KEY:
        # Return empty schema if no API key is provided
        return ResumeExtractionSchema()
    
    prompt = f"""
    You are an expert HR parsing system.
    Extract the following structured information from the provided resume text.
    Return ONLY a valid JSON object that exactly matches the following schema.
    Do not invent or hallucinate information. If a field is not found, return null or an empty list.

    Schema:
    {{
        "full_name": "string or null",
        "email": "string or null",
        "phone": "string or null",
        "linkedin": "string or null",
        "github": "string or null",
        "professional_summary": "string or null",
        "skills": [
            {{"name": "string", "category": "Technical or Soft or Language"}}
        ],
        "educations": [
            {{"institution": "string", "degree": "string", "field_of_study": "string", "start_date": "string", "end_date": "string", "score": "string"}}
        ],
        "experiences": [
            {{"company": "string", "title": "string", "start_date": "string", "end_date": "string", "description": "string"}}
        ],
        "projects": [
            {{"name": "string", "description": "string", "technologies": "string", "link": "string"}}
        ]
    }}

    Resume Text:
    \"\"\"
    {text}
    \"\"\"
    """
    
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        # Clean markdown codeblocks if they exist
        response_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(response_text)
        return ResumeExtractionSchema(**data)
    except Exception as e:
        print(f"Error parsing resume with LLM: {e}")
        return ResumeExtractionSchema()
