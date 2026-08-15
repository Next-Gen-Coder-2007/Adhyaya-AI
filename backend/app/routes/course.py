from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
import traceback

from app.core.database import get_db, SessionLocal
from app.models.course import Course
from app.models.module import Module
from app.models.section import Section
from app.schemas.course import CourseCreate, CourseResponse, CourseNotesUpdate
from app.schemas.section import QuizSubmitRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.middleware.auth import get_current_user
from app.ai.agents.curriculum_agent import generate_course_data
from app.ai.agents.embedding_agent import embed_course, delete_course_embeddings
from app.ai.agents.chat_agent import chat as rag_chat
from app.models.user import User

router = APIRouter(prefix="/courses", tags=["Courses"])

def generate_course_modules_task(
    course_id: int,
    youtube_url: str,
    is_playlist: bool = False,
):
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return

        print(f"[BACKGROUND TASK] Generating modules for Course {course_id}...")
        result = generate_course_data(course.title, course.description, youtube_url, is_playlist)

        if not result or not result.get("modules"):
            print(f"[BACKGROUND TASK WARNING] No modules generated for course {course_id}")
            course.status = "failed"
            course.error_message = "Could not extract video content or transcripts. Ensure video has captions or try another link."
            db.commit()
            return

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
                video_url=module_data.get("video_url") or youtube_url,
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
        course.error_message = None
        db.commit()
        db.refresh(course)
        print(f"[BACKGROUND TASK SUCCESS] Course {course_id} completed successfully with {len(result['modules'])} modules.")

        try:
            embed_course(course_id, modules_for_embed)
        except Exception as e:
            print(f"[EMBED ERROR] Failed to embed course {course_id}: {e}")

    except Exception as e:
        print(f"[BACKGROUND TASK ERROR] Failed generating course {course_id}: {e}")
        traceback.print_exc()
        try:
            course = db.query(Course).filter(Course.id == course_id).first()
            if course:
                course.status = "failed"
                course.error_message = f"Generation failed: {str(e)[:200]}"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()



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
        notes="",
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    background_tasks.add_task(
        generate_course_modules_task,
        new_course.id,
        course.youtube_url,
        course.is_playlist,
    )
    return new_course


@router.get("/", response_model=List[CourseResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.sections))
        .filter(Course.user_id == current_user.id)
        .order_by(Course.id.desc())
        .all()
    )


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.sections))
        .filter(
            Course.id == course_id,
            Course.user_id == current_user.id,
        )
        .first()
    )
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

    try:
        delete_course_embeddings(course_id)
    except Exception as e:
        print(f"[EMBED] Non-critical error deleting embeddings for course {course_id}: {e}")

    db.delete(course)
    db.commit()
    return {"detail": "Course deleted successfully"}


@router.get("/{course_id}/notes")
def get_course_notes(
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

    return {"notes": course.notes or ""}


@router.put("/{course_id}/notes")
def update_course_notes(
    course_id: int,
    data: CourseNotesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.notes = data.notes
    db.commit()
    return {"message": "Notes saved successfully", "notes": course.notes}


@router.get("/{course_id}/export")
def export_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.sections))
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lines = [
        f"# {course.title}",
        f"\n**Description:** {course.description}",
        f"\n**Source:** {course.youtube_url or 'N/A'}",
        "\n---\n",
        "## Course Syllabus\n"
    ]

    for m_idx, module in enumerate(course.modules, start=1):
        lines.append(f"### Module {m_idx}: {module.title}")
        for s_idx, section in enumerate(module.sections, start=1):
            status_mark = " [x]" if section.completed else " [ ]"
            lines.append(f"- {status_mark} **{section.title}** ({section.type.upper()})")
        lines.append("")

    if course.notes:
        lines.append("\n---\n## Student Study Notes\n")
        lines.append(course.notes)

    markdown_content = "\n".join(lines)
    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=course_{course_id}_notes.md"}
    )


@router.post("/{course_id}/chat", response_model=ChatResponse)
def course_chat(
    course_id: int,
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).options(joinedload(Course.modules)).filter(
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

    module_titles = [m.title for m in course.modules]
    history_dicts = [{"role": m.role, "content": m.content} for m in body.history]

    result = rag_chat(
        course_id=course_id,
        question=body.question,
        history=history_dicts,
        course_title=course.title,
        module_titles=module_titles,
    )

    return ChatResponse(answer=result["answer"], sources=result["sources"])


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


@router.post("/sections/{section_id}/quiz-submit")
def submit_quiz_score(
    section_id: int,
    data: QuizSubmitRequest,
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
        raise HTTPException(status_code=404, detail="Section not found")

    section.quiz_score = data.score
    section.quiz_answers = data.answers
    if data.score >= 60:
        section.completed = True

    db.commit()
    db.refresh(section)

    return {
        "id": section.id,
        "score": section.quiz_score,
        "completed": section.completed
    }