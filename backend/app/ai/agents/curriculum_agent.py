import json
from langchain_core.prompts import ChatPromptTemplate
from app.ai.services.llm_service import generate_with_gemini, generate_with_groq
from app.ai.services.youtube_service import get_transcript, get_playlist_videos
from app.ai.prompts.curriculum_prompts import COURSE_METADATA_PROMPT, MODULE_GENERATION_PROMPT


def clean_json(text: str):
    return text.strip().replace("```json", "").replace("```", "").strip()


def _generate_course_metadata(content: dict):
    prompt = ChatPromptTemplate.from_template(COURSE_METADATA_PROMPT)
    formatted_prompt = prompt.format(content=json.dumps(content))
    try:
        response = generate_with_gemini(formatted_prompt)
        return json.loads(clean_json(response))
    except Exception as e:
        print(f"Metadata Error: {e}")
        return {"title": "", "description": ""}


def _generate_modules_from_transcript(transcript: list[dict]):
    if not transcript:
        return {"modules": []}

    total_duration = transcript[-1]["end"]

    if total_duration < 1800:
        target_modules = 8
    elif total_duration < 3600:
        target_modules = 12
    elif total_duration < 7200:
        target_modules = 18
    elif total_duration < 18000:
        target_modules = 24
    else:
        target_modules = 30

    MAX_CHARS = 8000
    chunks, current, length = [], [], 0

    for item in transcript:
        line = f"{item['text']}\n"
        if length + len(line) > MAX_CHARS:
            if current:
                chunks.append(current)
            current, length = [], 0
        current.append(item)
        length += len(line)

    if current:
        chunks.append(current)

    print(f"Transcript Chunks: {len(chunks)}")

    generated = []
    per_chunk = max(1, target_modules // len(chunks))
    prompt = ChatPromptTemplate.from_template(MODULE_GENERATION_PROMPT)

    for i, chunk in enumerate(chunks):
        start, end = chunk[0]["start"], chunk[-1]["end"]
        text = "\n".join([c["text"] for c in chunk])

        print(f"\nProcessing Chunk {i+1}/{len(chunks)}")
        print(f"Chunk Range: {start:.2f}s -> {end:.2f}s")

        try:
            formatted = prompt.format(
                target_modules=per_chunk,
                chunk_start=round(start, 2),
                chunk_end=round(end, 2),
                transcript=text
            )

            response = generate_with_groq(formatted)
            cleaned = clean_json(response)

            if not cleaned:
                continue

            try:
                result = json.loads(cleaned)
            except json.JSONDecodeError as e:
                print(f"JSON Parse Error: {e}")
                print(cleaned[:1000])
                continue

            for m in result.get("modules", []):
                try:
                    title = m.get("title", "Untitled Module").strip()
                    s = max(start, float(m.get("start_time", start)))
                    e = min(end, float(m.get("end_time", end)))
                    if e <= s:
                        continue
                    generated.append({
                        "title": title,
                        "start_time": round(s, 2),
                        "end_time": round(e, 2)
                    })
                except Exception as e:
                    print(f"Module Parse Error: {e}")

        except Exception as e:
            print(f"\nChunk Generation Error: {e}")
            if "413" in str(e):
                print("Chunk too large. Skipping...")
                continue

    generated.sort(key=lambda x: x["start_time"])

    cleaned, seen = [], set()
    for m in generated:
        t = m["title"].lower().strip()
        if t in seen:
            continue
        seen.add(t)
        cleaned.append(m)

    if cleaned:
        cleaned[0]["start_time"] = 0
        cleaned[-1]["end_time"] = round(total_duration, 2)

    final = []
    for i, m in enumerate(cleaned):
        final.append(m)
        if i < len(cleaned) - 1:
            gap = cleaned[i + 1]["start_time"] - m["end_time"]
            if gap > 300:
                final.append({
                    "title": "Continuation",
                    "start_time": round(m["end_time"], 2),
                    "end_time": round(cleaned[i + 1]["start_time"], 2)
                })

    if not final:
        final = [{
            "title": "Complete Course",
            "start_time": 0,
            "end_time": round(total_duration, 2)
        }]

    print(f"\nGenerated Modules: {len(final)}")
    return {"modules": final}


def generate_course_data(title: str, description: str, youtube_url: str, is_playlist: bool = False):
    if not youtube_url:
        return {"title": title, "description": description, "modules": []}

    if is_playlist:
        videos = get_playlist_videos(youtube_url)
        modules = [{"title": v["title"], "video_url": v["url"]} for v in videos]
    else:
        transcript = get_transcript(youtube_url)
        modules = _generate_modules_from_transcript(transcript).get("modules", [])

    metadata = _generate_course_metadata({"title": title, "description": description})

    return {
        "title": metadata.get("title", title),
        "description": metadata.get("description", description),
        "modules": modules
    }