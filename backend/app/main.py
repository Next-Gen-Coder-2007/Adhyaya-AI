import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.routes.auth import router as auth_router
from app.routes.course import router as course_router
from app.core.database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Adhyaya AI API",
    description="Agentic AI Learning Platform API powering course generation, assessment synthesis, and RAG tutor",
    version="2.0.0",
)

# Dynamic Cloud CORS Configuration
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    custom_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
    allowed_origins = list(set(default_origins + custom_origins))
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root_status():
    return {
        "status": "online",
        "name": "Adhyaya AI API",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "features": [
            "curriculum_generation",
            "rag_tutor",
            "quizzes",
            "assignments",
            "notes",
            "markdown_export"
        ]
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"degraded: {str(e)[:100]}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "service": "adhyaya-ai-backend"
    }


app.include_router(auth_router)
app.include_router(course_router)