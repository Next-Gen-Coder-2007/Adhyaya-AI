from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
import traceback
import hashlib
from datetime import datetime

from app.core.database import get_db, SessionLocal
from app.models import Course, Module, Section, User
from app.schemas.course import CourseCreate, CourseResponse, CourseNotesUpdate
from app.schemas.section import QuizSubmitRequest
from app.schemas.chat import ChatRequest, ChatResponse
from app.middleware.auth import get_current_user
from app.ai.agents.curriculum_agent import generate_course_data
from app.ai.agents.embedding_agent import embed_course, delete_course_embeddings
from app.ai.agents.chat_agent import chat as rag_chat

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

            module_dict = dict(module_data)
            module_dict["sections"] = sections_for_embed
            modules_for_embed.append(module_dict)

        course.status = "completed"
        db.commit()

        # ChromaDB Vector Store Embeddings
        try:
            print(f"[EMBEDDING] Indexing vector embeddings for course {course_id} in ChromaDB...")
            embed_course(
                course_id=course_id,
                course_title=course.title,
                modules=modules_for_embed,
            )
            print(f"[EMBEDDING] Successfully indexed course {course_id}")
        except Exception as embed_err:
            print(f"[EMBEDDING ERROR] Failed to embed course {course_id}: {embed_err}")

    except Exception as e:
        print(f"[BACKGROUND TASK ERROR] Failed to generate course {course_id}: {e}")
        traceback.print_exc()
        try:
            course = db.query(Course).filter(Course.id == course_id).first()
            if course:
                course.status = "failed"
                course.error_message = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("", response_model=CourseResponse)
def create_course(
    data: CourseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = Course(
        title=data.title or "Interactive Course Track",
        description=data.description or "AI synthesized interactive course modules.",
        image_url=data.image_url,
        video_url=data.video_url,
        is_playlist=data.is_playlist,
        status="generating",
        user_id=current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    background_tasks.add_task(
        generate_course_modules_task,
        course.id,
        data.video_url,
        data.is_playlist,
    )

    return course


@router.get("", response_model=List[CourseResponse])
def get_user_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Course)
        .options(
            joinedload(Course.modules).joinedload(Module.sections)
        )
        .filter(Course.user_id == current_user.id)
        .order_by(Course.created_at.desc())
        .all()
    )


@router.get("/{course_id}", response_model=CourseResponse)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .options(
            joinedload(Course.modules).joinedload(Module.sections)
        )
        .filter(
            Course.id == course_id,
            Course.user_id == current_user.id
        )
        .first()
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .filter(
            Course.id == course_id,
            Course.user_id == current_user.id
        )
        .first()
    )

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
        delete_course_embeddings(course_id)
    except Exception as e:
        print(f"[EMBEDDING DELETE WARNING] {e}")

    db.delete(course)
    db.commit()

    return {"message": "Course and vector index deleted successfully"}


@router.get("/{course_id}/notes")
def get_course_notes(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )
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
    course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.notes = data.notes
    db.commit()

    return {"message": "Notes saved successfully", "notes": course.notes}


@router.get("/{course_id}/export")
def export_course_markdown(
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

    md_lines = [
        f"# {course.title}",
        f"\n**Course Overview:** {course.description or 'N/A'}",
        f"**Video Reference:** {course.video_url}",
        f"**Generated via:** Adhyaya AI Learning Platform",
        "\n---\n",
        "## Curriculum Outline & Learning Modules\n",
    ]

    for idx, mod in enumerate(course.modules or [], start=1):
        md_lines.append(f"### Module {idx}: {mod.title}")
        for s_idx, sec in enumerate(mod.sections or [], start=1):
            status = "[x]" if sec.completed else "[ ]"
            score_badge = f" (Quiz Score: {sec.quiz_score}%)" if sec.quiz_score is not None else ""
            md_lines.append(f"- {status} **{sec.title}** ({sec.type}){score_badge}")

            if sec.content:
                synopsis = sec.content.get("synopsis") or sec.content.get("description")
                if synopsis:
                    md_lines.append(f"  - *Synopsis:* {synopsis}")
        md_lines.append("")

    if course.notes:
        md_lines.append("\n---\n## Student Study Notes & Scratchpad\n")
        md_lines.append(course.notes)

    content = "\n".join(md_lines)
    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="adhyaya-course-{course.id}.md"'
        },
    )


@router.get("/{course_id}/certificate")
def get_course_certificate(
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

    all_sections = [s for m in (course.modules or []) for s in (m.sections or [])]
    total_sections = len(all_sections)
    completed_sections = len([s for s in all_sections if s.completed])
    
    quiz_scores = [s.quiz_score for s in all_sections if s.quiz_score is not None]
    avg_mastery = round(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else 100

    is_eligible = total_sections > 0 and completed_sections == total_sections

    raw_signature = f"ADHYAYA-CERT-{course.id}-{current_user.id}-{course.created_at}"
    cert_hash = hashlib.sha256(raw_signature.encode("utf-8")).hexdigest()[:12].upper()
    certificate_id = f"ADY-{course.id:03d}-{cert_hash}"

    issued_date = datetime.utcnow().strftime("%B %d, %Y")

    return {
        "certificate_id": certificate_id,
        "is_eligible": is_eligible,
        "course_id": course.id,
        "course_title": course.title,
        "student_name": current_user.name or "Adhyaya Scholar",
        "student_email": current_user.email,
        "total_lessons": total_sections,
        "completed_lessons": completed_sections,
        "mastery_score": max(avg_mastery, 80),
        "issued_at": issued_date,
        "verification_hash": cert_hash
    }


@router.post("/{course_id}/chat", response_model=ChatResponse)
def chat_with_course(
    course_id: int,
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = (
        db.query(Course)
        .filter(Course.id == course_id, Course.user_id == current_user.id)
        .first()
    )

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Course is still being generated. Please wait."
        )

    try:
        result = rag_chat(
            course_id=course_id,
            question=data.question,
            history=data.history or [],
        )
    except Exception as e:
        print(f"[RAG CHAT ERROR] {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"RAG tutor error: {str(e)}"
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