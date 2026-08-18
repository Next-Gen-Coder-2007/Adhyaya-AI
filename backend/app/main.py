import time
import logging
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.models import Course, Module, Section, User
from app.routes.auth import router as auth_router
from app.routes.course import router as course_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("adhyaya.api")

# Auto-create table schemas on boot with error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Could not connect to database on startup: {e}. Please verify DATABASE_URL.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Agentic AI Learning Operating System API powering course synthesis, assessment generation, and RAG tutor",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Process timing and telemetry middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f"{process_time}ms"
    return response


# Dynamic Cloud CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if "*" not in settings.ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def root_status():
    return {
        "status": "online",
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "features": [
            "curriculum_generation",
            "rag_tutor",
            "quizzes",
            "assignments",
            "notes",
            "markdown_export",
            "certificates",
            "telemetry"
        ]
    }


@app.get("/health", tags=["System"])
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


@app.get("/health/stats", tags=["System"])
def health_stats(db: Session = Depends(get_db)):
    try:
        total_courses = db.query(Course).count()
        total_modules = db.query(Module).count()
        total_sections = db.query(Section).count()
        total_users = db.query(User).count()
        completed_sections = db.query(Section).filter(Section.completed == True).count()

        return {
            "status": "healthy",
            "metrics": {
                "total_users": total_users,
                "total_courses": total_courses,
                "total_modules": total_modules,
                "total_sections": total_sections,
                "completed_sections": completed_sections,
                "completion_rate": f"{round((completed_sections / total_sections * 100), 1)}%" if total_sections > 0 else "0.0%"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }


# Mount API routers
app.include_router(auth_router)
app.include_router(course_router)