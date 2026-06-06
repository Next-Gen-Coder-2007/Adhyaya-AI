
import os
import json
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("[EMBED] Loading sentence-transformers model (first run downloads ~90 MB)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[EMBED] Model loaded.")
    return _model


_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "chroma_db")

_chroma: Optional[Any] = None

def _get_chroma() -> Any:
    global _chroma
    if _chroma is None:
        _chroma = chromadb.PersistentClient(
            path=_DB_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
    return _chroma


def _get_collection(course_id: int):
    return _get_chroma().get_or_create_collection(
        name=f"course_{course_id}",
        metadata={"hnsw:space": "cosine"},
    )


def _embed(texts: List[str]) -> List[List[float]]:
    model = _get_model()
    vecs = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return vecs.tolist()


def _chunk_text(text: str, chunk_size: int = 200, overlap: int = 40) -> List[str]:
    words = text.split()
    chunks: List[str] = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
    return chunks


def _extract_text(section: Dict[str, Any]) -> str:
    content = section.get("content", "")
    stype = section.get("type", "")

    if isinstance(content, str):
        return content

    if isinstance(content, dict):
        parts: List[str] = []

        if "summary" in content and isinstance(content["summary"], str):
            parts.append(content["summary"])
        if "key_takeaways" in content:
            parts.extend(str(t) for t in content["key_takeaways"])

        if "assignments" in content:
            for a in content["assignments"]:
                if isinstance(a, dict):
                    parts.append(a.get("title", ""))
                    parts.append(a.get("description", ""))

        return " ".join(p for p in parts if p)

    return ""


def embed_course(course_id: int, modules: List[Dict[str, Any]]) -> None:
    collection = _get_collection(course_id)

    try:
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass

    documents: List[str] = []
    metadatas: List[Dict] = []
    ids: List[str] = []

    for m_idx, module in enumerate(modules):
        module_title = module.get("title", f"Module {m_idx + 1}")

        for s_idx, section in enumerate(module.get("sections", [])):
            stype = section.get("type", "")

            if stype == "quiz":
                continue

            raw_text = _extract_text(section)
            if not raw_text or len(raw_text.split()) < 10:
                continue

            chunks = _chunk_text(raw_text)

            for c_idx, chunk in enumerate(chunks):
                chunk_id = f"c{course_id}_m{m_idx}_s{s_idx}_ch{c_idx}"
                documents.append(chunk)
                metadatas.append(
                    {
                        "course_id": str(course_id),
                        "module_title": module_title,
                        "section_type": stype,
                        "section_title": section.get("title", ""),
                        "start_time": str(section.get("start_time", "")),
                    }
                )
                ids.append(chunk_id)

    if not documents:
        print(f"[EMBED] No text found to embed for course {course_id}.")
        return

    print(f"[EMBED] Embedding {len(documents)} chunks for course {course_id}...")
    embeddings = _embed(documents)
    collection.add(documents=documents, embeddings=embeddings,
                   metadatas=metadatas, ids=ids)
    print(f"[EMBED] Done. {len(documents)} chunks stored.")


def retrieve(course_id: int, question: str, top_k: int = 5) -> List[Dict[str, Any]]:
    collection = _get_collection(course_id)

    count = collection.count()
    if count == 0:
        return []

    q_embedding = _embed([question])[0]
    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas"],
    )

    chunks: List[Dict[str, Any]] = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append({"text": doc, "metadata": meta})
    return chunks


def delete_course_embeddings(course_id: int) -> None:
    try:
        _get_chroma().delete_collection(f"course_{course_id}")
        print(f"[EMBED] Deleted embeddings for course {course_id}.")
    except Exception as e:
        print(f"[EMBED] Could not delete collection: {e}")