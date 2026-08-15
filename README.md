<p align="center">
  <img src="frontend/src/assets/logo.png" width="100" alt="Adhyaya AI Logo" style="border-radius: 20px;"/>
</p>

<h1 align="center">Adhyaya AI</h1>

<p align="center">
  <strong>An Agentic AI-Powered Learning Operating System</strong><br/>
  <em>Transforming Unstructured Video Feeds into Interactive, Multi-Agent Curricula with RAG Tutoring & Active Assessments</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain"/>
  <img src="https://img.shields.io/badge/Groq_Llama_3.3_70B-F05A28?style=for-the-badge" alt="Groq Llama 3.3"/>
  <img src="https://img.shields.io/badge/ChromaDB-Vector_Store-FF6F00?style=for-the-badge" alt="ChromaDB"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11+"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## 📌 Executive Summary

Modern learners consume hours of educational video content passively with low retention and zero structured feedback. **Adhyaya AI** converts raw YouTube videos and playlists into full-fledged, structured course workspaces similar to Coursera and Udemy.

By orchestrating specialized AI agents, Adhyaya AI extracts semantic transcripts, synthesizes hierarchical learning modules, generates interactive section assessments, provisions hands-on project labs, and embeds a **Retrieval-Augmented Generation (RAG) AI Tutor** with clickable `[MM:SS]` video timestamp citations.

---

## 🏛️ System Architecture

```text
                                  ┌───────────────────────────┐
                                  │   YouTube Video / URL     │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   YouTube Transcript API  │
                                  │  (Multi-Language Fallback)│
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                      ┌───────────────────────────────────────────────────┐
                      │            Multi-Agent Synthesis Engine           │
                      │                                                   │
                      │   1. Curriculum Agent     ──> Course Hierarchy    │
                      │   2. Structuring Agent    ──> Timeline Synopses   │
                      │   3. Assessment Agent     ──> MCQs & Quizzes      │
                      │   4. Project Lab Agent    ──> Hands-on Missions   │
                      │   5. Resource Agent       ──> Curated References  │
                      └─────────────────────────┬─────────────────────────┘
                                                │
                                                ▼
                      ┌───────────────────────────────────────────────────┐
                      │             Vector Indexing & Embedding           │
                      │       (BAAI/bge-small-en-v1.5 + ChromaDB)         │
                      └─────────────────────────┬─────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌─────────────────────────────────┐                           ┌─────────────────────────────────┐
│     Interactive Study Studio    │                           │      RAG AI Tutor Companion     │
│  - Synchronized Video Player    │                           │  - Semantic Context Grounding   │
│  - Practice Quiz Grading Engine │ ◄───────────────────────► │  - Clickable [MM:SS] Seeking    │
│  - Timestamped Notes Scratchpad │                           │  - 1-Click "Insert into Notes"  │
│  - Markdown Syllabus Exporter   │                           │  - Multi-turn Conversational RAG│
└─────────────────────────────────┘                           └─────────────────────────────────┘
```

---

## 🤖 Multi-Agent Orchestration Breakdown

Adhyaya AI employs a decoupled multi-agent architecture built on **LangChain** with automatic provider failover between **Groq (Llama-3.3-70b-versatile)** and **Google Gemini (Gemini-2.5-flash)**:

| Agent | Responsibility | Output Artifact |
| :--- | :--- | :--- |
| **Curriculum Agent** | Parses transcripts, maps logical milestones, and clusters concepts into structured modules. | Hierarchical Course Tree |
| **Content Structuring Agent** | Maps timeline start/end boundaries, extracts core concepts, and authors concise synopses. | Timestamped Lesson Nodes |
| **Assessment Generation Agent** | Synthesizes MCQs, True/False, and conceptual questions with detailed rationale explanations. | Interactive Quizzes |
| **Practical Lab Agent** | Formulates real-world engineering missions, objective checklists, and evaluation rubrics. | Applied Project Labs |
| **Resource Agent** | Identifies official documentation, cheat sheets, and external learning references. | Curated Reference Links |
| **AI Tutor Agent (RAG)** | Performs similarity search against ChromaDB chunk embeddings to answer learner queries with timestamp citations. | Context-Grounded Responses |

---

## ✨ Core Platform Capabilities

### 1. Interactive Study Studio Workspace
- **Timeline-Synchronized Video Player**: Custom controls with variable playback speed (0.75x–2x), 10s skips, and timeline scrubbers.
- **Section Practice Quizzes**: Instant answer validation, dynamic scoring rings, detailed explanation feedback, and retry capabilities.
- **Hands-on Mission Labs**: Step-by-step objectives with difficulty tags and self-evaluation rubrics.
- **Timestamped Study Scratchpad**: Live Markdown notes editor with **"+ Insert Current Video Timestamp"** and 1-click Markdown syllabus export.

### 2. Clickable Timestamp AI Tutor
- Real-time RAG companion grounded in lecture transcripts.
- Formats citations as clickable `[MM:SS]` buttons that seek the video player to exact moments.
- Includes quick-prompt chips (*"Summarize key takeaways"*, *"Create flashcards"*) and **"Add to Study Notes"** integration.

### 3. Dynamic Theme Engine & Zero-Flicker Dark/Light Mode
- **5 Curated Color Themes**: *Amber Gold*, *Emerald Matrix*, *Cyber Indigo*, *Amethyst Violet*, and *Rose Quartz*.
- **Top Header Quick Controls**: Instant dark/light mode toggle and palette dropdown directly in the global header.
- Synchronized `localStorage` caching ensures zero theme flash during page transitions.

### 4. One-Click Starter Presets
- Instant 1-click course generator presets (*React in 100s, Python Crash Course, Neural Networks 101, Git & GitHub*) for seamless testing and demonstration.

---

## ⚙️ Engineering & Resiliency Highlights

- **Thread-Safe Session Isolation**: Background course synthesis tasks execute inside dedicated `SessionLocal()` lifecycles, preventing request-scoped session crashes during long-running LLM workflows.
- **Multi-Provider Fallback & Concurrency Control**: Implements thread semaphores with exponential backoff on HTTP 429 rate limits, automatically failing over from Groq to Gemini Flash.
- **Self-Healing JSON Recovery**: Resilient regex parser that extracts raw JSON blocks, repairs unescaped quotes, and strips trailing commas before schema ingestion.
- **Resilient YouTube Caption Extraction**: Language priority fallbacks (`en`, `en-US`, `en-GB`, `hi`) with auto-generated caption parsing and translation fallbacks.

---

## 🛠️ Technology Stack

```text
Frontend:     React 19 · Vite · Tailwind CSS · Lucide React · Axios · HTML5 Video API
Backend:      FastAPI · Python 3.11+ · SQLAlchemy 2.0 · SQLite · PostgreSQL (Cloud)
AI & RAG:     LangChain · Groq (Llama 3.3 70B) · Google Gemini · ChromaDB · SentenceTransformers
Auth:         JWT HTTP-only Cookies · Passlib (Bcrypt) · Google OAuth 2.0
Deployment:   Docker · Gunicorn · Uvicorn · Render Blueprint (render.yaml) · Procfile
```

---

## 📂 Project Structure

```text
Adhyaya-AI/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── agents/          # Multi-agent implementations (curriculum, quiz, chat, etc.)
│   │   │   └── services/        # LLM orchestration, embedding, and YouTube services
│   │   ├── core/                # Database engine, security, and JWT configuration
│   │   ├── models/              # SQLAlchemy database models (Course, Module, Section, User)
│   │   ├── routes/              # FastAPI routers (auth, course, notes, quizzes)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   └── main.py              # Application entrypoint, CORS, and health checks
│   ├── Dockerfile               # Production container definition
│   ├── render.yaml              # 1-Click Render Cloud deployment blueprint
│   ├── Procfile                 # Cloud PaaS process configuration
│   ├── run.py                   # Production server launcher
│   └── requirements.txt         # Pinned Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Courses/         # Study Studio, Custom Player, Chat Panel, Course Cards
│   │   │   └── Dashboard/       # Navigation header, quick theme picker, avatars
│   │   ├── context/             # AuthContext and dynamic theme DOM manager
│   │   ├── pages/               # Dashboard, Catalog, Settings, Profile, Auth views
│   │   └── index.css            # CSS theme variables and global light/dark cascades
│   └── package.json
└── README.md
```

---

## 🔌 API Reference Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register new user account with hashed password | ❌ |
| `POST` | `/auth/login` | Authenticate user and issue JWT cookie | ❌ |
| `POST` | `/auth/google` | Google OAuth 2.0 token exchange | ❌ |
| `GET` | `/auth/me` | Fetch authenticated user profile & preferences | ✅ |
| `PATCH` | `/auth/me/settings` | Update theme palette, dark/light mode, & font scaling | ✅ |
| `GET` | `/courses` | Retrieve user's enrolled course catalog | ✅ |
| `POST` | `/courses` | Initialize AI course generation from YouTube URL | ✅ |
| `GET` | `/courses/{id}` | Fetch full course curriculum, modules, & sections | ✅ |
| `DELETE` | `/courses/{id}` | Remove course and associated vector embeddings | ✅ |
| `POST` | `/courses/{id}/chat` | Query RAG AI Tutor for lecture-grounded answers | ✅ |
| `GET` | `/courses/{id}/notes` | Retrieve course study notes and bookmarks | ✅ |
| `PUT` | `/courses/{id}/notes` | Save user study notes and timestamped scratchpad | ✅ |
| `GET` | `/courses/{id}/export` | Export course syllabus and notes as formatted Markdown | ✅ |
| `POST` | `/courses/sections/{id}/quiz-submit` | Grade quiz submission and persist mastery score | ✅ |
| `PATCH` | `/courses/sections/{id}/toggle` | Toggle lesson completion status | ✅ |
| `GET` | `/health` | Liveness & database connection health probe | ❌ |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.0.0+
- **Python**: v3.11.0+
- **Git**

### 2. Environment Setup

#### Backend Configuration (`backend/.env`)
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_google_youtube_v3_api_key
GOOGLE_URL=https://www.googleapis.com/oauth2/v3/userinfo
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_google_youtube_v3_api_key
```

### 3. Installation & Local Development

```bash
# 1. Clone repository
git clone https://github.com/Next-Gen-Coder-2007/Adhyaya-AI.git
cd Adhyaya-AI

# 2. Setup and run backend
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate | On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python run.py

# 3. Setup and run frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Docs (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/health`

---

## ☁️ Cloud Deployment

### Deploy with Docker
```bash
cd backend
docker build -t adhyaya-ai-backend .
docker run -p 8000:8000 --env-file .env adhyaya-ai-backend
```

### Deploy to Render / Railway
1. **Render**: Create a new Web Service pointing to `backend/` using the included [`render.yaml`](file:///e:/OLD%20Files/Adhyaya%20AI/backend/render.yaml) blueprint. It will automatically provision a managed PostgreSQL database and configure connection pooling.
2. **Railway**: Link your GitHub repository. Railway automatically recognizes the `Dockerfile` and `Procfile`. Add the required environment variables in the Railway dashboard.

---

## 📄 License
This project is licensed under the **MIT License**. Built with ❤️ for next-generation interactive AI education.
