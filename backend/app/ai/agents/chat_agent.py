from typing import List, Dict, Any

from app.ai.agents.embedding_agent import retrieve
from app.ai.services.llm_service import generate_with_groq


def _build_system_prompt(course_title: str, module_titles: List[str]) -> str:
    modules = (
        ", ".join(f'"{title}"' for title in module_titles)
        if module_titles
        else "multiple modules"
    )

    return f"""
        You are an expert AI Tutor inside Adhyaya AI.

        The student is studying the course: "{course_title}".

        Available modules:
        {modules}

        Instructions:
        - Answer strictly and accurately using the retrieved course context.
        - Whenever referencing specific moments in a video, format timestamps explicitly as `[MM:SS]` (e.g. `[02:30]` or `[14:45]`) so the learner can click to jump to that timestamp in the video.
        - Mention the module name whenever referencing information.
        - Keep responses concise, structured, educational, and easy to understand with bullet points or numbered steps where appropriate.
        - If the answer is not present in the context, respond helpfully with:
        "That specific topic isn't covered in the retrieved course material. Try revisiting [suggest the most relevant module name]."
        """.strip()


def _format_time(value: Any) -> str:
    try:
        total_seconds = int(float(value))
        minutes, seconds = divmod(total_seconds, 60)
        return f"{minutes}:{seconds:02d}"
    except (ValueError, TypeError):
        return ""


def _build_context(chunks: List[Dict[str, Any]]) -> str:
    if not chunks:
        return "No relevant course content was found."

    formatted_chunks = []

    for chunk in chunks:
        metadata = chunk.get("metadata", {})

        module_title = metadata.get("module_title", "Unknown Module")
        section_type = metadata.get("section_type", "content")
        start_time = metadata.get("start_time")
        score = chunk.get("score", 0)

        timestamp = _format_time(start_time)
        timestamp_label = f" @ {timestamp}" if timestamp else ""

        label = (
            f"[{module_title} › {section_type}{timestamp_label}] "
            f"(relevance={score})"
        )

        formatted_chunks.append(f"{label}\n{chunk.get('text', '')}")

    return "\n\n---\n\n".join(formatted_chunks)


def _build_history(history: List[Dict[str, Any]]) -> str:
    if not history:
        return "(start of conversation)"

    messages = []

    for item in history[-6:]:
        role = "Student" if item.get("role") == "user" else "Tutor"
        content = item.get("content", "").strip()

        if content:
            messages.append(f"{role}: {content}")

    return "\n".join(messages)


def _build_prompt(
    question: str,
    context_chunks: List[Dict[str, Any]],
    history: List[Dict[str, Any]],
    course_title: str,
    module_titles: List[str],
) -> str:
    system_prompt = _build_system_prompt(course_title, module_titles)

    context_text = _build_context(context_chunks)
    history_text = _build_history(history)

    return f"""
        {system_prompt}

        === RETRIEVED CONTEXT ===
        {context_text}

        === CONVERSATION HISTORY ===
        {history_text}

        === STUDENT QUESTION ===
        {question}

        === TUTOR ANSWER ===
        """.strip()


def _extract_sources(chunks: List[Dict[str, Any]]) -> List[str]:
    seen = set()
    sources = []

    for chunk in chunks:
        title = chunk.get("metadata", {}).get("module_title")

        if title and title not in seen:
            seen.add(title)
            sources.append(title)

    return sources


def chat(
    course_id: int,
    question: str,
    history: List[Dict[str, Any]],
    course_title: str = "this course",
    module_titles: List[str] = None,
) -> Dict[str, Any]:
    module_titles = module_titles or []

    context_chunks = retrieve(
        course_id=course_id,
        question=question,
        top_k=5,
        score_threshold=0.35,
    )

    prompt = _build_prompt(
        question=question,
        context_chunks=context_chunks,
        history=history,
        course_title=course_title,
        module_titles=module_titles,
    )

    try:
        response = generate_with_groq(prompt)
        answer = response.strip()
    except Exception as error:
        print(f"[CHAT ERROR] {error}")
        answer = (
            "Sorry, I encountered an issue while generating the response. "
            "Please try again."
        )

    return {
        "answer": answer,
        "sources": _extract_sources(context_chunks),
    }