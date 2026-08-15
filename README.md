<<<<<<< HEAD
# Adhyaya AI 🚀
=======
<p align="center">
  <img src="./frontend/public/logo.png" width="180"/>
</p>

<h1 align="center">Adhyaya AI</h1>

>>>>>>> 74c0b8eedb15f0968a41891edbb42b49e503837a

An agentic AI-powered learning platform that transforms YouTube videos and playlists into structured, interactive courses with section-wise quizzes, practical assignments, live timestamped notes, and an embedded RAG AI tutor.

---

## 🌟 Overview

**Adhyaya AI** converts unstructured educational content from YouTube into an interactive, structured course experience similar to platforms like Coursera and Udemy.

Instead of passively watching videos, learners get:
- **Interactive Study Room**: Video player synchronized with transcript timelines and speed controls.
- **Section-wise Practice Quizzes**: Immediate feedback, scoring animations, and retake capabilities.
- **Practical Labs & Assignments**: Objective milestones, hands-on tasks, and self-evaluation rubrics.
- **Synthesized Notes & Mindmaps**: Key takeaways, rich synopses, and recommended references.
- **Live Timestamped Scratchpad**: In-app notes editor with 1-click video timestamp insertion and Markdown export.
- **Course-Aware RAG AI Tutor**: Embedded conversational companion with clickable `[MM:SS]` timestamp citations that seek video directly.
- **Dynamic Theme Engine**: 5 curated palettes (*Amber Gold, Emerald Matrix, Cyber Indigo, Amethyst Purple, Rose Coral*) with full Dark/Light mode support.

---

## 🤖 Multi-Agent AI System

```text
YouTube Video / Playlist
        ↓
Curriculum Agent (Extracts key topics & builds course hierarchy)
        ↓
Content Structuring Agent (Processes transcripts into timeline-bound lessons)
        ↓
Quiz & Assessment Agent (Synthesizes MCQs, True/False, & conceptual tests)
        ↓
Assignment Agent (Designs applied coding & project exercises)
        ↓
Resource Agent (Curates documentation & external references)
        ↓
ChromaDB Vector Store (Chunks, embeds, & indexes content)
        ↓
AI Tutor Agent (RAG-grounded tutor with clickable timestamp citations)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + CSS Custom Properties Theme Engine
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Player**: Custom HTML5/YouTube Player Wrapper with timeline sync

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database & ORM**: SQLite / SQLAlchemy 2.0 with isolated background tasks
- **Vector Database**: ChromaDB
- **Embeddings**: `BAAI/bge-small-en-v1.5` via SentenceTransformers
- **LLM Orchestration**: LangChain + Groq (`llama-3.3-70b-versatile`) with Gemini fallback
- **Authentication**: JWT Cookies + Google OAuth 2.0

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### 2. Environment Variables

#### Backend `.env` (`backend/.env`)
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_v3_api_key
GOOGLE_URL=https://www.googleapis.com/oauth2/v3/userinfo
```

#### Frontend `.env` (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_YOUTUBE_API_KEY=your_youtube_v3_api_key
```

### 3. Installation & Run

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Run both in development
cd ..
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`.

---

## 📄 License
MIT License. Built for next-generation interactive AI education.
