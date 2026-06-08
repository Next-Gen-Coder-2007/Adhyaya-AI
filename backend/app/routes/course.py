from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.course import Course
from app.models.module import Module
from app.models.section import Section
from app.schemas.course import CourseCreate, CourseResponse
from app.middleware.auth import get_current_user
from app.ai.agents.curriculum_agent import generate_course_data
from app.ai.agents.embedding_agent import embed_course, delete_course_embeddings
from app.ai.agents.chat_agent import chat as rag_chat
from app.models.user import User

router = APIRouter(prefix="/courses", tags=["Courses"])


def generate_course_modules(
    course_id: int,
    youtube_url: str,
    db: Session,
    is_playlist: bool = False,
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return

    result = generate_course_data(course.title, course.description, youtube_url, is_playlist)

    if result.get("title"):
        course.title = result["title"]
    if result.get("description"):
        course.description = result["description"]

    modules_for_embed = []

    for module_data in result["modules"]:
        module = Module(
            title=module_data["title"],
            start_time=module_data.get("start_time"),
            end_time=module_data.get("end_time"),
            video_url=module_data.get("video_url"),
            course_id=course.id,
        )
        db.add(module)
        db.flush()

        sections_for_embed = []
        for section_data in module_data.get("sections", []):
            section = Section(
                type=section_data["type"],
                title=section_data["title"],
                start_time=section_data.get("start_time"),
                end_time=section_data.get("end_time"),
                content=section_data.get("content"),
                module_id=module.id,
            )
            db.add(section)
            sections_for_embed.append(section_data)

        modules_for_embed.append({
            "title": module_data["title"],
            "sections": sections_for_embed,
        })

    course.status = "completed"
    db.commit()
    db.refresh(course)

    # Embed all course text after saving to DB
    try:
        embed_course(course_id, modules_for_embed)
    except Exception as e:
        print(f"[EMBED ERROR] Failed to embed course {course_id}: {e}")


@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_course = Course(
        title=course.title,
        description=course.description,
        image_url=course.image_url,
        youtube_url=course.youtube_url,
        user_id=current_user.id,
        is_playlist=course.is_playlist,
        status="generating",
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    background_tasks.add_task(
        generate_course_modules,
        new_course.id,
        course.youtube_url,
        db,
        course.is_playlist,
    )
    return new_course


@router.get("/", response_model=List[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Course).filter(Course.user_id == current_user.id).all()


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    delete_course_embeddings(course_id)
    db.delete(course)
    db.commit()
    return {"detail": "Course deleted"}


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str


@router.post("/{course_id}/chat", response_model=ChatResponse)
def course_chat(
    course_id: int,
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Course is still generating. Please wait until it's ready.",
        )

    history_dicts = [{"role": m.role, "content": m.content} for m in body.history]
    answer = rag_chat(course_id, body.question, history_dicts)
    return {"answer": answer}

@router.patch("/sections/{section_id}/toggle")
def toggle_section_completion(
    section_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    section = (
        db.query(Section)
        .join(Module, Section.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .filter(
            Section.id == section_id,
            Course.user_id == current_user.id
        )
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=404,
            detail="Section not found"
        )

    section.completed = not section.completed

    db.commit()
    db.refresh(section)

    return {
        "id": section.id,
        "completed": section.completed
    }