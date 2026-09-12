import os
import PyPDF2
from sqlalchemy.orm import Session
from app.db import models
from app.services.embedding_service import index_document_chunk, search_documents
import google.generativeai as genai
from app.core.config import settings
import uuid

def process_document(file_path: str, user_id: str, document_id: str):
    # Extract text
    text = ""
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading doc: {e}")
        return
        
    # Chunking
    chunk_size = 1000
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    
    # Index
    for i, chunk in enumerate(chunks):
        chunk_id = str(uuid.uuid4())
        index_document_chunk(
            chunk_id=chunk_id,
            text=chunk,
            metadata={"user_id": user_id, "document_id": document_id, "chunk_index": i}
        )

def answer_document_question(user_id: str, document_id: str, question: str) -> str:
    # Retrieve relevant chunks
    results = search_documents(question, user_id, n_results=3)
    
    if not results or not results['documents'] or len(results['documents'][0]) == 0:
        return "The uploaded document does not contain enough information to answer this."
        
    context = "\n".join(results['documents'][0])
    
    # LLM Generate
    if not settings.LLM_API_KEY:
        return "LLM API Key missing. Context retrieved: " + context[:200]
        
    genai.configure(api_key=settings.LLM_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""
    You are an AI assistant answering a question based ONLY on the provided document context.
    If the context does not contain the answer, say "The uploaded document does not contain enough information to answer this."
    Do not hallucinate.

    Context:
    {context}
    
    Question: {question}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error answering doc question: {e}")
        return "Failed to generate answer."
