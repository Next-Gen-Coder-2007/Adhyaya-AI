import json
from langchain_core.prompts import ChatPromptTemplate
from app.ai.services.llm_service import llm
from app.ai.services.youtube_service import get_transcript, get_playlist_videos
from app.ai.prompts.curriculum_prompts import COURSE_METADATA_PROMPT, CURRICULUM_PROMPT

def _generate_course_metadata(content: str) -> dict:
    prompt = ChatPromptTemplate.from_template(COURSE_METADATA_PROMPT)
    chain = prompt | llm
    response = chain.invoke({"content": content[:15000]})

    try:
        return json.loads(response.content)
    except:
        return {"title": "", "description": ""}

def _generate_modules_from_transcript(transcript: str) -> dict:
    if not transcript:
        return {"modules": []}

    prompt = ChatPromptTemplate.from_template(CURRICULUM_PROMPT)
    chain = prompt | llm
    response = chain.invoke({"transcript": transcript[:15000]})

    try:
        return json.loads(response.content)
    except:
        return {"modules": []}

def generate_course_data(youtube_url: str, is_playlist: bool = False) -> dict:
    if not youtube_url:
        return {"title": "", "description": "", "modules": []}

    if is_playlist:
        playlist_videos = get_playlist_videos(youtube_url)
        modules = [
            {"title": video["title"], "video_url": video["url"]}
            for video in playlist_videos
        ]
        content = f"Playlist: {playlist_videos[0]['title']}" if playlist_videos else ""
    else:
        transcript = get_transcript(youtube_url)
        modules_result = _generate_modules_from_transcript(transcript)
        modules = modules_result.get("modules", [])
        content = transcript[:15000] if transcript else ""

    metadata = _generate_course_metadata(content)

    return {
        "title": metadata.get("title", ""),
        "description": metadata.get("description", ""),
        "modules": modules
    }