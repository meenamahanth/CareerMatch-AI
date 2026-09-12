<div align="center">

# 🚀 AI Career Companion Agent for Internship Matching and Interview Preparation

<a href="https://github.com/Readme-Workflows/Readme-Icons"><img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=2400&pause=700&color=4F46E5&center=true&vCenter=true&multiline=true&repeat=true&width=950&height=90&lines=Welcome+to+AI+Career+Companion+%E2%9C%A8;Upload+Resume+%E2%80%A2+Find+Internships+%E2%80%A2+Prepare+For+Interviews;Learn+%E2%86%92+Practice+%E2%86%92+Prepare+%E2%86%92+Succeed" alt="AI Career Companion animated typing headline" /></a>

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1.svg)](https://www.mysql.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-FF69B4.svg)](https://www.trychroma.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-LLM-FFC107.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

*Upload your resume → discover relevant internships → prepare for interviews → chat with your documents.*

</div>

---

**Quick Links:**
[Features](#-key-features) • [Architecture](#%EF%B8%8F-architecture) • [Getting Started](#-getting-started) • [Workflow](#-demo-workflow) • [Limitations & Roadmap](#-limitations--roadmap)

---

## 📸 Project Snapshot

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Python + FastAPI + SQLAlchemy + Alembic |
| **Database** | MySQL (Source of Truth) |
| **Vector Store** | ChromaDB (Semantic Search) |
| **Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2`) |
| **LLM Engine** | Google Generative AI (Gemini 1.5) |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt |

---

## ✨ Key Features

- **🔐 Secure Authentication**: JWT-based protected routes with hashed passwords and strict user-data isolation.
- **📄 Resume Intelligence**: Extract structured JSON information directly from PDF resumes using AI.
- **🎯 Internship Matching**: Semantic internship retrieval using `Sentence-Transformers` embeddings and ChromaDB.
- **🤖 Interview Agent**: Personalized technical and behavioral mock interviews with dynamic AI evaluation and scoring.
- **📚 Document Q&A**: Upload custom PDF documents and ask questions grounded strictly in the document text using RAG.

---

## 🏗️ Architecture

### Why MySQL + ChromaDB?
We enforce a strict separation of concerns between our business data and our semantic search layers:

| Feature | MySQL | ChromaDB |
| :--- | :--- | :--- |
| **Role** | Source of Truth | Semantic Retrieval Layer |
| **Data Type** | Structured (Users, Resumes, Profiles) | Vector Embeddings |
| **Capabilities** | ACID Transactions, Relationships | Similarity Search (L2 Distance) |
| **Usage** | Application State, Auth, History | Context retrieval for the LLM |

### Core Workflow

```mermaid
flowchart LR
    U[Candidate] --> F[React Frontend]
    F --> B[FastAPI Backend]
    
    subgraph Data Layer
        B --> M[(MySQL)]
        B --> C[(ChromaDB)]
    end
    
    subgraph AI Engine
        B --> G[Gemini LLM]
        B --> E[Sentence Transformers]
    end
```

<details>
<summary><strong>View Detailed Sub-Workflows</strong></summary>

**Resume Processing Workflow**
```mermaid
flowchart TD
    A[Upload PDF] --> B[Extract Raw Text]
    B --> C[Gemini Structured Parsing]
    C --> D[Pydantic Validation]
    D --> E[(MySQL Resumes/Skills Table)]
```

**Internship Matching Workflow**
```mermaid
flowchart TD
    A[User Resume Skills] --> B[Sentence-Transformers]
    B --> C[(ChromaDB Vector Search)]
    C --> D[Retrieve Top 5 Internships]
    D --> E[Gemini Match Explanation]
    E --> F[Return Match JSON]
```
</details>

---

## 📂 Project Structure

```text
CareerMatch-AI/
├── backend/
│   ├── alembic/                 # Database migrations
│   ├── app/
│   │   ├── api/routes/          # FastAPI endpoint handlers
│   │   ├── core/                # JWT and Config logic
│   │   ├── db/                  # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Core business logic (RAG, Agents)
│   ├── scripts/                 # Database seeding
│   ├── tests/                   # Pytest suite
│   ├── .env.example             # Environment template
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios configuration
│   │   ├── components/          # Shared UI (Layout, etc)
│   │   ├── context/             # React Auth context
│   │   └── pages/               # Route components
│   ├── package.json             # NPM dependencies
│   └── tailwind.config.js       # Styling configuration
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server (Running locally on port 3306)
- Google Gemini API Key

### 2. Database Initialization
Log into your local MySQL server and create the required database:
```sql
CREATE DATABASE career_match_ai;
```

### 3. Environment Variables
Navigate to `backend/` and copy the template:
```bash
cp .env.example .env
```
Update `.env` with your actual secrets:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/career_match_ai
JWT_SECRET_KEY=supersecretkey_change_in_production
LLM_PROVIDER=gemini
LLM_API_KEY=YOUR_GEMINI_API_KEY
CHROMA_PERSIST_DIR=./chroma_db
UPLOAD_DIRECTORY=./storage
```

### 4. Backend Setup
```bash
cd backend
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1
# OR (Mac/Linux)
source venv/bin/activate

pip install -r requirements.txt

# Run migrations to generate tables
alembic upgrade head

# Seed 5 demo internships and build the initial vector index
python scripts/seed_database.py

# Start the server
uvicorn app.main:app --reload
```

### 5. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
Interactive Backend API Documentation is at `http://localhost:8000/docs`.

---

## 🛤️ Demo Workflow

1. **Create Account**: Register via the frontend `/register` route.
2. **Upload Resume**: Navigate to the Resume tab and upload a sample PDF resume.
3. **Review Profile**: View the parsed, structured JSON data mapped to your profile.
4. **Find Matches**: Navigate to the Matching tab and let the RAG engine find the best internships.
5. **Start Interview**: Head to Mock Interviews and chat with the AI trained specifically on your resume.
6. **Upload a Document**: Use the Document Q&A tab to upload an arbitrary PDF and ask questions about it.

---

## 🚧 Limitations & Roadmap

### Known Limitations
- Resume parsing and Document Q&A currently only support **PDF** files. `.docx` format processing is pending.
- First-time backend startup may take slightly longer as `Sentence-Transformers` downloads the `all-MiniLM-L6-v2` weights locally.

### Roadmap
- [x] JWT authentication
- [x] PDF resume parsing
- [x] Internship semantic matching
- [x] Mock interview agent
- [x] Document Q&A
- [ ] DOCX resume support
- [ ] Expanded internship dataset
- [ ] Cloud deployment (Dockerization)

---

## ⚠️ Disclaimer

> *CareerMatch AI provides AI-assisted recommendations and mock interview practice. Internship matching results and AI-generated feedback should be treated as decision-support tools rather than guaranteed employment or selection outcomes. Do not upload highly sensitive personal identifiable information (PII).*
