from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.course import Course
from app.models.module import Module
from app.models.user import User

from app.schemas.course import (
    CourseCreate,
    CourseResponse
)

from app.middleware.auth import (
    get_current_user
)

from app.ai.services.youtube_service import (
    get_transcript
)

from app.ai.agents.curriculum_agent import (
    generate_modules
)

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


def generate_course_modules(
    course_id: int,
    youtube_url: str,
    db: Session
):
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    transcript = get_transcript(youtube_url)

    result = generate_modules(transcript)

    for index, item in enumerate(result["modules"]):


        module = Module(
            title=item["title"],
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
        status="generating"
    )

    db.add(new_course)

    db.commit()

    db.refresh(new_course)

    background_tasks.add_task(
        generate_course_modules,
        new_course.id,
        course.youtube_url,
        db
    )

    return new_course

@router.get("/", response_model=list[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    courses = db.query(Course).filter(
        Course.user_id == current_user.id
    ).all()

    return courses