import os
import re
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer


_MODEL_NAME = "BAAI/bge-small-en-v1.5"
_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

_model: Optional[SentenceTransformer] = None
_chroma_client: Optional[chromadb.PersistentClient] = None

_DB_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "..",
    "chroma_db",
)


def _get_model() -> SentenceTransformer:
    global _model

    if _model is None:
        print(f"[EMBED] Loading {_MODEL_NAME}...")
        _model = SentenceTransformer(_MODEL_NAME)
        print("[EMBED] Model loaded.")

    return _model


def _get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client

    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=_DB_PATH,
            settings=Settings(anonymized_telemetry=False),
        )

    return _chroma_client


def _get_collection(course_id: int):
    return _get_chroma_client().get_or_create_collection(
        name=f"course_{course_id}",
        metadata={"hnsw:space": "cosine"},
    )


def _embed(texts: List[str], is_query: bool = False) -> List[List[float]]:
    model = _get_model()

    if is_query:
        texts = [_QUERY_PREFIX + text for text in texts]

    vectors = model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    return vectors.tolist()


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


def embed_course(
    course_id: int,
    modules: List[Dict[str, Any]],
) -> None:
    collection = _get_collection(course_id)

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
        print(
            f"[EMBED] No valid content found for course {course_id}."
        )
        return

    print(
        f"[EMBED] Embedding {len(documents)} chunks "
        f"for course {course_id}..."
    )

    embeddings = _embed(documents)

    collection.add(
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
    )

    print(
        f"[EMBED] Stored {len(documents)} chunks "
        f"for course {course_id}."
    )


def retrieve(
    course_id: int,
    question: str,
    top_k: int = 5,
    score_threshold: float = 0.35,
) -> List[Dict[str, Any]]:
    collection = _get_collection(course_id)

    if collection.count() == 0:
        return []

    query_embedding = _embed(
        [question],
        is_query=True,
    )[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    retrieved_chunks: List[Dict[str, Any]] = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):
        similarity = 1.0 - (distance / 2.0)

        if similarity < score_threshold:
            continue

        retrieved_chunks.append(
            {
                "text": document,
                "metadata": metadata,
                "score": round(similarity, 3),
            }
        )

    return retrieved_chunks


def delete_course_embeddings(course_id: int) -> None:
    try:
        _get_chroma_client().delete_collection(
            f"course_{course_id}"
        )

        print(
            f"[EMBED] Deleted embeddings "
            f"for course {course_id}."
        )

    except Exception as error:
        print(
            f"[EMBED] Failed to delete embeddings: {error}"
        )