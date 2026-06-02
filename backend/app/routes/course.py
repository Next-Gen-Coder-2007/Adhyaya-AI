from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.course import Course
from app.models.module import Module
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse
from app.middleware.auth import get_current_user
from app.ai.agents.curriculum_agent import generate_course_data

router = APIRouter(prefix="/courses", tags=["Courses"])

def generate_course_modules(
    course_id: int,
    youtube_url: str,
    db: Session,
    is_playlist: bool = False
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return

    result = generate_course_data(course.title, course.description, youtube_url, is_playlist)

    if result.get("title"):
        course.title = result["title"]
    if result.get("description"):
        course.description = result["description"]

    for item in result["modules"]:
        module = Module(
            title=item["title"],
            start_time=item.get("start_time"),
            end_time=item.get("end_time"),
            video_url=item.get("video_url"),
            course_id=course.id
        )
        db.add(module)

    course.status = "completed"
    db.commit()
    db.refresh(course)

@router.post("/", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_course = Course(
        title=course.title,
        description=course.description,
        image_url=course.image_url,
        youtube_url=course.youtube_url,
        user_id=current_user.id,
        is_playlist=course.is_playlist,
        status="generating"
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    background_tasks.add_task(
        generate_course_modules,
        new_course.id,
        course.youtube_url,
        db,
        course.is_playlist
    )

    return new_course

@router.get("/", response_model=list[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Course).filter(Course.user_id == current_user.id).all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course