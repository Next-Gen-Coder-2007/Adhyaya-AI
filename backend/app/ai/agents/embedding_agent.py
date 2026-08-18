import os
import re
import math
import logging
from typing import List, Dict, Any, Optional
from collections import Counter

from app.core.config import settings

logger = logging.getLogger(__name__)

_DB_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "..",
    "chroma_db",
)

_chroma_client = None
_embedding_model = None
_in_memory_store: Dict[int, Dict[str, Any]] = {}


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None and settings.GOOGLE_API_KEY:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            _embedding_model = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GOOGLE_API_KEY,
            )
            logger.info("[EMBED] Loaded Google Gemini Embeddings (text-embedding-004)")
        except Exception as e:
            logger.warning(f"[EMBED] Could not load GoogleGenerativeAIEmbeddings: {e}")
            _embedding_model = None
    return _embedding_model


def _get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        try:
            import chromadb
            from chromadb.config import Settings
            _chroma_client = chromadb.PersistentClient(
                path=_DB_PATH,
                settings=Settings(anonymized_telemetry=False),
            )
        except Exception as e:
            logger.warning(f"[CHROMA] ChromaDB client unavailable, using in-memory store: {e}")
            _chroma_client = None
    return _chroma_client


def _get_collection(course_id: int):
    client = _get_chroma_client()
    if client:
        try:
            return client.get_or_create_collection(
                name=f"course_{course_id}",
                metadata={"hnsw:space": "cosine"},
            )
        except Exception as e:
            logger.warning(f"[CHROMA] Failed to get/create collection course_{course_id}: {e}")
    return None


def _simple_tf_embed(texts: List[str], dim: int = 128) -> List[List[float]]:
    """Ultra-lightweight hash-based vectorizer using 0MB RAM."""
    vectors = []
    for text in texts:
        tokens = re.findall(r'\w+', text.lower())
        vec = [0.0] * dim
        if not tokens:
            vectors.append(vec)
            continue
        counts = Counter(tokens)
        for token, count in counts.items():
            idx = abs(hash(token)) % dim
            vec[idx] += float(count)
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        vectors.append(vec)
    return vectors


def _embed(texts: List[str], is_query: bool = False) -> List[List[float]]:
    if not texts:
        return []

    model = _get_embedding_model()
    if model:
        try:
            if is_query:
                return [model.embed_query(t) for t in texts]
            else:
                return model.embed_documents(texts)
        except Exception as e:
            logger.warning(f"[EMBED API Error] Fallback to lightweight vectorizer: {e}")

    return _simple_tf_embed(texts)


def _sentence_tokenize(text: str) -> List[str]:
    text = text.strip()

    if not text:
        return []

    sentences = re.split(
        r"(?<=[.!?])\s+(?=[A-Z])",
        text,
    )

    return [sentence.strip() for sentence in sentences if sentence.strip()]


def _chunk_text(
    text: str,
    target_words: int = 150,
    overlap_sentences: int = 2,
) -> List[str]:
    sentences = _sentence_tokenize(text)

    if not sentences:
        return []

    chunks: List[str] = []
    current_chunk: List[str] = []
    current_words = 0

    for sentence in sentences:
        sentence_words = len(sentence.split())

        if (
            current_chunk
            and current_words + sentence_words > target_words
        ):
            chunks.append(" ".join(current_chunk))

            current_chunk = current_chunk[-overlap_sentences:]
            current_words = sum(
                len(item.split()) for item in current_chunk
            )

        current_chunk.append(sentence)
        current_words += sentence_words

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def _extract_text(section: Dict[str, Any]) -> str:
    content = section.get("content")
    title = section.get("title", "")

    extracted: List[str] = []

    if title:
        extracted.append(title)

    if isinstance(content, str):
        extracted.append(content)
        return " ".join(filter(None, extracted))

    if not isinstance(content, dict):
        return " ".join(filter(None, extracted))

    summary = content.get("summary")
    if isinstance(summary, str):
        extracted.append(summary)

    key_takeaways = content.get("key_takeaways", [])
    extracted.extend(str(item) for item in key_takeaways)

    assignments = content.get("assignments", [])
    for assignment in assignments:
        if not isinstance(assignment, dict):
            continue

        extracted.append(assignment.get("title", ""))
        extracted.append(assignment.get("description", ""))

        for task in assignment.get("tasks", []):
            extracted.append(str(task))

    questions = content.get("questions", [])
    for question in questions:
        if not isinstance(question, dict):
            continue

        extracted.append(question.get("question", ""))
        extracted.append(
            f"Answer: {question.get('correct_answer', '')}"
        )

        explanation = question.get("explanation")
        if explanation:
            extracted.append(f"Explanation: {explanation}")

    video = content.get("video")
    if isinstance(video, str):
        extracted.append(video)

    return " ".join(
        item.strip()
        for item in extracted
        if isinstance(item, str) and item.strip()
    )


def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 > 0 and norm2 > 0:
        return dot / (norm1 * norm2)
    return 0.0


def embed_course(
    course_id: int,
    modules: List[Dict[str, Any]],
    course_title: Optional[str] = None,
) -> None:
    collection = _get_collection(course_id)

    if collection:
        try:
            existing = collection.get()
            if existing.get("ids"):
                collection.delete(ids=existing["ids"])
        except Exception:
            pass

    documents: List[str] = []
    metadatas: List[Dict[str, str]] = []
    ids: List[str] = []

    for module_index, module in enumerate(modules):
        module_title = module.get(
            "title",
            f"Module {module_index + 1}",
        )

        sections = module.get("sections", [])

        for section_index, section in enumerate(sections):
            text = _extract_text(section)

            if len(text.split()) < 8:
                continue

            chunks = _chunk_text(text)

            for chunk_index, chunk in enumerate(chunks):
                chunk_id = (
                    f"c{course_id}_"
                    f"m{module_index}_"
                    f"s{section_index}_"
                    f"ch{chunk_index}"
                )

                documents.append(chunk)

                metadatas.append(
                    {
                        "course_id": str(course_id),
                        "course_title": str(course_title or ""),
                        "module_title": module_title,
                        "section_type": section.get("type", ""),
                        "section_title": section.get("title", ""),
                        "start_time": str(
                            section.get("start_time", "")
                        ),
                    }
                )

                ids.append(chunk_id)

    if not documents:
        logger.info(f"[EMBED] No valid content found for course {course_id}.")
        return

    logger.info(f"[EMBED] Embedding {len(documents)} chunks for course {course_id}...")
    embeddings = _embed(documents)

    # Save to in-memory fallback store
    _in_memory_store[course_id] = {
        "documents": documents,
        "embeddings": embeddings,
        "metadatas": metadatas,
        "ids": ids,
    }

    # Save to ChromaDB if available
    if collection:
        try:
            collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info(f"[EMBED] Stored {len(documents)} chunks in ChromaDB for course {course_id}.")
        except Exception as e:
            logger.warning(f"[EMBED] Failed to store in ChromaDB (using in-memory fallback): {e}")


def retrieve(
    course_id: int,
    question: str,
    top_k: int = 5,
    score_threshold: float = 0.25,
) -> List[Dict[str, Any]]:
    query_embeddings = _embed([question], is_query=True)
    if not query_embeddings:
        return []
    query_embedding = query_embeddings[0]

    collection = _get_collection(course_id)

    # Try ChromaDB query first
    if collection:
        try:
            if collection.count() > 0:
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(top_k, collection.count()),
                    include=["documents", "metadatas", "distances"],
                )
                documents = results["documents"][0]
                metadatas = results["metadatas"][0]
                distances = results["distances"][0]

                retrieved_chunks: List[Dict[str, Any]] = []
                for document, metadata, distance in zip(documents, metadatas, distances):
                    similarity = 1.0 - (distance / 2.0)
                    if similarity < score_threshold:
                        continue
                    retrieved_chunks.append({
                        "text": document,
                        "metadata": metadata,
                        "score": round(similarity, 3),
                    })
                return retrieved_chunks
        except Exception as e:
            logger.warning(f"[RETRIEVE] ChromaDB query failed (using in-memory store): {e}")

    # Fallback to in-memory store
    store = _in_memory_store.get(course_id)
    if not store or not store.get("documents"):
        return []

    scored_items = []
    for doc, meta, emb in zip(store["documents"], store["metadatas"], store["embeddings"]):
        sim = _cosine_similarity(query_embedding, emb)
        if sim >= score_threshold:
            scored_items.append({
                "text": doc,
                "metadata": meta,
                "score": round(sim, 3),
            })

    scored_items.sort(key=lambda x: x["score"], reverse=True)
    return scored_items[:top_k]


def delete_course_embeddings(course_id: int) -> None:
    _in_memory_store.pop(course_id, None)
    client = _get_chroma_client()
    if client:
        try:
            client.delete_collection(f"course_{course_id}")
            logger.info(f"[EMBED] Deleted embeddings for course {course_id}.")
        except Exception as error:
            logger.warning(f"[EMBED] Failed to delete Chroma collection: {error}")