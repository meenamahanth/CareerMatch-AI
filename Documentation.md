# Career Match AI — Technical Documentation

**Created by Madireddy Meena Mahanth Hariandh**

## Repository layout

```text
Career-Match-AI-Redesigned/
├── backend/
│   ├── app/                 # FastAPI application, routers, models and services
│   ├── data/                # Internship and RAG FAISS indexes/metadata
│   ├── knowledge_base/      # Source documents for RAG indexing
│   ├── uploads/             # Local development scratch space only
│   ├── requirements.txt
│   ├── .env.example
│   ├── Procfile
│   └── render.yaml
├── frontend/                # React + TypeScript + Vite SPA
├── README.md
└── documentation.md
```

## Backend architecture

The only API server is `backend/app/main.py`. It includes authentication, profile, resume, cover-letter, career-assistant, interview-agent, and voice-resume routers. `/health` is a lightweight unauthenticated process check. SQLAlchemy uses `DATABASE_URL` for PostgreSQL in production and a local SQLite database only for development. Resume and interview source documents are persisted in database binary columns; local upload paths are temporary during parsing.

The matching pipeline uses the bundled FAISS internship index, candidate preprocessing, and ranking/explanation services. The career assistant retrieves relevant content from the bundled RAG index. Groq calls stay server-side and read credentials from `GROQ_API_KEY`; `GROQ_MODEL` can override the default model.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Set GROQ_API_KEY and JWT_SECRET_KEY in backend/.env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run the frontend from a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The frontend API client reads `VITE_API_BASE_URL`. The Vite dev proxy also forwards supported API paths to the local backend.

## Render deployment

Use `backend/render.yaml` as the Render Blueprint configuration. The service root is `backend/`; its build command installs `requirements.txt`, and its start command runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Configure `DATABASE_URL` with managed PostgreSQL, `GROQ_API_KEY`, `JWT_SECRET_KEY`, and the deployed Vercel origin in `FRONTEND_URL` (or `CORS_ORIGINS`). Render checks `/health`.

## Vercel deployment

Set Vercel's project root to `frontend`, build with `npm run build`, publish `dist`, and configure `VITE_API_BASE_URL` with the Render API's HTTPS URL. `frontend/vercel.json` rewrites SPA routes to `index.html`.

For setup details and troubleshooting, see [README.md](README.md).
