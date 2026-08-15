from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.course import router as course_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Adhyaya AI API",
    description="Agentic AI Learning Platform API powering course generation, assessment synthesis, and RAG tutor",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "name": "Adhyaya AI API",
        "version": "2.0.0",
        "features": ["curriculum_generation", "rag_tutor", "quizzes", "assignments", "notes"]
    }

app.include_router(auth_router)
app.include_router(course_router)