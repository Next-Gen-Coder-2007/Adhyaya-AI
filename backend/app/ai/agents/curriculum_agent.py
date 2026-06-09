import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from langchain_core.prompts import ChatPromptTemplate
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Dict, Any

from app.ai.services.llm_service import generate_with_groq
from app.ai.services.youtube_service import get_transcript, get_playlist_videos
from app.ai.prompts.curriculum_prompts import COURSE_METADATA_PROMPT, MODULE_GENERATION_PROMPT, SECTION_TITLE_PROMPT
from app.ai.agents.quiz_agent import QuizAgent
from app.ai.agents.assignment_agent import AssignmentAgent
from app.ai.agents.summary_agent import SummaryAgent

quiz_agent = QuizAgent()
assignment_agent = AssignmentAgent()
summary_agent = SummaryAgent()

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def safe_generate_with_groq(prompt: str) -> str:
    print(f"[GROQ CALL] Generating (Prompt length: {len(prompt)} chars)")
    start_time = time.time()
    response = generate_with_groq(prompt)
    print(f"[GROQ CALL] Response received in {time.time() - start_time:.2f}s")
    return response

def clean_json(text: str) -> str:
    if not text:
        return ""
    text = text.replace("```json", "").replace("```", "").strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON found in response")
    return match.group(0)

def _generate_course_metadata(content: Dict) -> Dict:
    print(f"[METADATA] Generating metadata for: {content.get('title', 'Untitled')}")
    prompt = ChatPromptTemplate.from_template(COURSE_METADATA_PROMPT)
    formatted_prompt = prompt.format(content=json.dumps(content))
    try:
        response = safe_generate_with_groq(formatted_prompt)
        metadata = json.loads(clean_json(response))
        print(f"[METADATA] Metadata generated: {metadata.get('title', 'Untitled')}")
        return metadata
    except Exception as e:
        print(f"[METADATA ERROR] {e}")
        return {"title": content.get("title", ""), "description": content.get("description", "")}

def _generate_section_titles_batch(module_title: str, texts: List[str]) -> List[str]:
    num_sections = len(texts)
    print(f"[SECTION TITLES] Generating {num_sections} section titles for module: {module_title}")

    combined_text = "\n---\n".join(texts)
    prompt = ChatPromptTemplate.from_template(SECTION_TITLE_PROMPT)
    formatted = prompt.format(
        module_title=module_title,
        num_sections=num_sections,
        content=combined_text
    )

    try:
        response = safe_generate_with_groq(formatted)
        raw_titles = response.strip().split("\n")
        titles = [t.strip() for t in raw_titles if t.strip()]

        print(f"[SECTION TITLES] Generated {len(titles)} titles for module: {module_title}")

        if len(titles) < num_sections:
            default_titles = []
            for i in range(num_sections - len(titles)):
                section_text = texts[len(titles) + i]
                words = section_text.split()[:5]
                default_title = " ".join(words).strip() + "..." if len(words) == 5 else " ".join(words).strip()
                default_titles.append(default_title)
            titles.extend(default_titles)
            print(f"[SECTION TITLES] Filled {len(default_titles)} missing titles with meaningful defaults")
        elif len(titles) > num_sections:
            titles = titles[:num_sections]
            print(f"[SECTION TITLES] Truncated to {num_sections} titles")

        return titles
    except Exception as e:
        print(f"[SECTION TITLES ERROR] {e}")
        return [
            " ".join(text.split()[:5]).strip() + "..." if len(text.split()) > 5 else text.strip()
            for text in texts
        ]

def _generate_sections_for_module(module: Dict, transcript_chunk: List[Dict]) -> List[Dict]:
    print(f"[MODULE] Generating sections for module: {module['title']} ({module['start_time']:.2f}s - {module['end_time']:.2f}s)")
    sections = []
    module_duration = module["end_time"] - module["start_time"]
    module_content = module.get("content", "")

    content_length = len(module_content)
    # Generate sections based on duration instead of chars
    if module_duration <= 600:          # <= 10 mins
        num_sections = 2
    elif module_duration <= 1200:       # <= 20 mins
        num_sections = 3
    elif module_duration <= 2400:       # <= 40 mins
        num_sections = 5
    else:
        num_sections = min(8, int(module_duration // 480))
    section_duration = module_duration / num_sections
    print(f"[MODULE] Content length: {content_length} chars. Targeting {num_sections} sections (~{section_duration:.2f}s per section)")

    sub_chunks = []
    current_chunk, current_time = [], module["start_time"]
    for item in transcript_chunk:
        if item["start"] >= module["end_time"]:
            break
        if item["start"] >= current_time + section_duration and current_chunk:
            sub_chunks.append(current_chunk)
            current_chunk, current_time = [], current_time + section_duration
        current_chunk.append(item)
    if current_chunk:
        sub_chunks.append(current_chunk)
    print(f"[MODULE] Split into {len(sub_chunks)} sub-chunks for module: {module['title']}")

    section_texts = ["\n".join([c["text"] for c in chunk]) for chunk in sub_chunks]
    section_titles = _generate_section_titles_batch(module["title"], section_texts)

    if len(section_titles) != len(sub_chunks):
        print(f"[WARNING] Mismatch in section_titles ({len(section_titles)}) and sub_chunks ({len(sub_chunks)}). Using defaults for missing titles.")
        for i in range(len(sub_chunks) - len(section_titles)):
            section_text = "\n".join([c["text"] for c in sub_chunks[len(section_titles) + i]])
            words = section_text.split()[:5]
            default_title = " ".join(words).strip() + "..." if len(words) == 5 else " ".join(words).strip()
            section_titles.append(default_title)

    for i, chunk in enumerate(sub_chunks):
        if not chunk:
            continue
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        text = "\n".join([c["text"] for c in chunk])
        sections.append({
            "type": "video",
            "title": section_titles[i],
            "start_time": round(start, 2),
            "end_time": round(end, 2),
            "content": text
        })
        print(f"[SECTION] Added video section: {section_titles[i]} ({start:.2f}s - {end:.2f}s)")
    print(f"[MODULE] Generating quiz/assignment/summary for module: {module['title']}")
    quiz       = quiz_agent.generate_quiz(module_content)
    assignment = assignment_agent.generate_assignment(module_content)
    summary    = summary_agent.generate_summary(module_content)

    sections.append({"type": "quiz",       "title": f"Quiz: {module['title']}",       "content": quiz})
    sections.append({"type": "assignment", "title": f"Assignment: {module['title']}", "content": assignment})
    sections.append({"type": "summary",    "title": f"Summary: {module['title']}",    "content": summary})
    print(f"[MODULE] Added quiz, assignment, and summary for module: {module['title']}")

    print(f"[MODULE] Completed sections for module: {module['title']} (Total sections: {len(sections)})")
    return sections

def _generate_modules_from_transcript(transcript: List[Dict]) -> Dict:
    if not transcript:
        print("[TRANSCRIPT] Empty transcript provided.")
        return {"modules": []}

    total_duration = transcript[-1]["end"]
    print(f"[TRANSCRIPT] Processing transcript (Duration: {total_duration:.2f}s, Items: {len(transcript)})")
    if total_duration <= 900:
        target_modules = 1
    elif total_duration <= 1800:
        target_modules = 2
    elif total_duration <= 3600:
        target_modules = 3
    elif total_duration <= 7200:
        target_modules = 5
    else:
        target_modules = min(8, int(total_duration // 1800))
    print(f"[TRANSCRIPT] Targeting {target_modules} modules for {total_duration:.2f}s transcript")

    MAX_CHARS = 20000
    chunks = []
    current_chunk, current_length = [], 0

    for item in transcript:
        line = f"{item['text']}\n"
        if current_length + len(line) > MAX_CHARS and current_chunk:
            chunks.append(current_chunk)
            current_chunk, current_length = [], 0
        current_chunk.append(item)
        current_length += len(line)
    if current_chunk:
        chunks.append(current_chunk)
    print(f"[TRANSCRIPT] Split into {len(chunks)} chunks (MAX_CHARS={MAX_CHARS})")

    generated = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_index = {}
        for i, chunk in enumerate(chunks):
            start, end = chunk[0]["start"], chunk[-1]["end"]
            text = "\n".join([c["text"] for c in chunk])
            per_chunk = max(1, target_modules // len(chunks))

            prompt = ChatPromptTemplate.from_template(MODULE_GENERATION_PROMPT)
            formatted = prompt.format(
                target_modules=per_chunk,
                chunk_start=round(start, 2),
                chunk_end=round(end, 2),
                transcript=text
            )
            future = executor.submit(safe_generate_with_groq, formatted)
            future_to_index[future] = i
            print(f"[CHUNK {i+1}/{len(chunks)}] Submitted for processing (Range: {start:.2f}s - {end:.2f}s)")

        for future in as_completed(future_to_index):
            index = future_to_index[future]
            try:
                response = future.result()
                cleaned = clean_json(response)
                result = json.loads(cleaned)
                for m in result.get("modules", []):
                    title = m.get("title", "Untitled Module").strip()
                    s = max(chunks[index][0]["start"], float(m.get("start_time", start)))
                    e = min(chunks[index][-1]["end"], float(m.get("end_time", end)))
                    if e <= s:
                        continue
                    generated.append({
                        "title": title,
                        "start_time": round(s, 2),
                        "end_time": round(e, 2),
                        "content": text,
                        "chunk": chunks[index]
                    })
                    print(f"[CHUNK {index+1}] Generated module: {title} ({s:.2f}s - {e:.2f}s)")
            except Exception as e:
                print(f"[CHUNK {index+1} ERROR] {e}")

    generated.sort(key=lambda x: x["start_time"])
    cleaned, seen = [], set()
    for m in generated:
        t = m["title"].lower().strip()
        if t in seen:
            print(f"[DUPLICATE] Skipping duplicate module: {m['title']}")
            continue
        seen.add(t)
        cleaned.append(m)
    print(f"[MODULES] Deduplicated modules (Original: {len(generated)}, Cleaned: {len(cleaned)})")

    if cleaned:
        cleaned[0]["start_time"] = 0
        cleaned[-1]["end_time"] = round(total_duration, 2)
        print(f"[MODULES] Adjusted start/end times for first/last modules")

    return {"modules": cleaned}

def generate_course_data(
    title: str,
    description: str,
    youtube_url: str,
    is_playlist: bool = False
) -> Dict:
    print(f"[COURSE] Starting course generation: {title}")
    start_time = time.time()

    if not youtube_url:
        print("[COURSE] No YouTube URL provided. Returning empty course.")
        return {"title": title, "description": description, "modules": []}

    if is_playlist:
        print(f"[PLAYLIST] Fetching videos from playlist: {youtube_url}")
        videos = get_playlist_videos(youtube_url)
        print(f"[PLAYLIST] Found {len(videos)} videos in playlist")
        modules = []
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = []
            for i, video in enumerate(videos):
                print(f"[VIDEO {i+1}/{len(videos)}] Fetching transcript for: {video['url']}")
                transcript = get_transcript(video["url"])
                print(f"[VIDEO {i+1}/{len(videos)}] Transcript fetched (Items: {len(transcript)})")
                futures.append(executor.submit(_generate_modules_from_transcript, transcript))

            for i, future in enumerate(futures):
                video_modules = future.result().get("modules", [])
                modules.extend(video_modules)
                print(f"[VIDEO] Generated {len(video_modules)} modules for a video")
    else:
        print(f"[VIDEO] Fetching transcript for: {youtube_url}")
        transcript = get_transcript(youtube_url)
        print(f"[VIDEO] Transcript fetched (Items: {len(transcript)})")
        modules = _generate_modules_from_transcript(transcript).get("modules", [])
        print(f"[VIDEO] Generated {len(modules)} modules")

    print(f"[SECTIONS] Generating sections for {len(modules)} modules")
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_index = {}
        for i, module in enumerate(modules):
            transcript_chunk = [
                c for c in transcript
                if module["start_time"] <= c["start"] <= module["end_time"]
            ]
            future = executor.submit(
                _generate_sections_for_module,
                module,
                transcript_chunk
            )
            future_to_index[future] = i
            print(f"[MODULE {i+1}/{len(modules)}] Submitted for section generation: {module['title']}")

        for future in as_completed(future_to_index):
            index = future_to_index[future]
            try:
                modules[index]["sections"] = future.result()
                print(f"[MODULE {index+1}/{len(modules)}] Sections generated for: {modules[index]['title']}")
            except Exception as e:
                print(f"[MODULE {index+1} ERROR] {e}")
                modules[index]["sections"] = []

    print("[METADATA] Generating course metadata")
    metadata = _generate_course_metadata({"title": title, "description": description})

    print(f"[COURSE] Completed course generation in {time.time() - start_time:.2f}s")
    return {
        "title": metadata.get("title", title),
        "description": metadata.get("description", description),
        "modules": modules
    }