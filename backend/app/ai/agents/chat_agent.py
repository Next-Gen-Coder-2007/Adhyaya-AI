from typing import List, Dict, Any
from app.ai.agents.embedding_agent import retrieve
from app.ai.services.llm_service import generate_with_groq

SYSTEM_PROMPT = """You are an AI tutor embedded inside an online course called Adhyaya AI.
You help students understand the course material better.

Rules:
- Answer ONLY based on the course content provided in the context below.
- If the answer is not in the context, say: "I don't have enough course material to answer that — try checking the relevant module."
- Keep answers concise and educational (2–5 sentences unless a list is clearer).
- Always mention which module the information comes from when relevant.
- Use simple, friendly language. No jargon unless the course uses it.
- Never make up information."""


def build_prompt(question: str, context_chunks: List[Dict], history: List[Dict]) -> str:
    if context_chunks:
        context_parts = []
        for chunk in context_chunks:
            meta = chunk["metadata"]
            label = f"[{meta.get('module_title', 'Unknown module')} › {meta.get('section_type', '')}]"
            context_parts.append(f"{label}\n{chunk['text']}")
        context_text = "\n\n---\n\n".join(context_parts)
    else:
        context_text = "No course content available."

    history_text = ""
    if history:
        lines = []
        for msg in history[-6:]:
            role = "Student" if msg.get("role") == "user" else "Tutor"
            lines.append(f"{role}: {msg.get('content', '')}")
        history_text = "\n".join(lines)

    prompt = f"""{SYSTEM_PROMPT}

=== COURSE CONTENT (retrieved) ===
{context_text}

=== CONVERSATION HISTORY ===
{history_text if history_text else "(start of conversation)"}

=== STUDENT QUESTION ===
{question}

=== TUTOR ANSWER ==="""

    return prompt


def chat(course_id: int, question: str, history: List[Dict[str, Any]]) -> str:
    context_chunks = retrieve(course_id, question, top_k=5)

    prompt = build_prompt(question, context_chunks, history)

    try:
        answer = generate_with_groq(prompt)
        return answer.strip()
    except Exception as e:
        print(f"[CHAT ERROR] {e}")
        return "Sorry, I ran into an issue generating a response. Please try again."