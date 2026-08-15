import os
import re
import logging
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)


def is_valid_playlist_url(url: str) -> bool:
    return bool(re.search(r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]list=([a-zA-Z0-9_-]+)", url))


def extract_video_id(url: str) -> str | None:
    match = re.search(
        r"(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})",
        url
    )
    return match.group(1) if match else None


def _format_snippet(item) -> dict:
    text = getattr(item, "text", item.get("text", "") if isinstance(item, dict) else "")
    start = getattr(item, "start", item.get("start", 0) if isinstance(item, dict) else 0)
    duration = getattr(item, "duration", item.get("duration", 0) if isinstance(item, dict) else 0)
    
    start_f = float(start) if start is not None else 0.0
    duration_f = float(duration) if duration is not None else 0.0
    
    return {
        "text": str(text).strip(),
        "start": round(start_f, 2),
        "end": round(start_f + duration_f, 2)
    }


def get_transcript(url: str) -> list[dict]:
    video_id = extract_video_id(url)
    if not video_id:
        return []

    languages = ['en', 'en-US', 'en-GB', 'en-CA', 'en-IN', 'hi', 'es', 'fr', 'de']

    # Strategy 1: YouTubeTranscriptApi().fetch(...) [v1.0+ instance API]
    try:
        api = YouTubeTranscriptApi()
        if hasattr(api, "fetch"):
            try:
                res = api.fetch(video_id, languages=languages)
            except Exception:
                res = api.fetch(video_id)
            
            snippets = getattr(res, "snippets", res)
            items = [_format_snippet(s) for s in snippets]
            items = [i for i in items if i["text"]]
            if items:
                logger.info(f"[TRANSCRIPT] Extracted {len(items)} items using v1.0+ fetch API for {video_id}")
                return items
    except Exception as e:
        logger.debug(f"[TRANSCRIPT] Strategy 1 failed for {video_id}: {e}")

    # Strategy 2: YouTubeTranscriptApi.get_transcript(...) [Legacy static method]
    try:
        if hasattr(YouTubeTranscriptApi, "get_transcript"):
            raw_items = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
            items = [_format_snippet(s) for s in raw_items]
            items = [i for i in items if i["text"]]
            if items:
                logger.info(f"[TRANSCRIPT] Extracted {len(items)} items using legacy static API for {video_id}")
                return items
    except Exception as e:
        logger.debug(f"[TRANSCRIPT] Strategy 2 failed for {video_id}: {e}")

    # Strategy 3: Transcript Listing with Translation fallback
    try:
        api = YouTubeTranscriptApi()
        transcript_list = None
        if hasattr(api, "list"):
            transcript_list = api.list(video_id)
        elif hasattr(YouTubeTranscriptApi, "list_transcripts"):
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        if transcript_list:
            transcript = None
            try:
                if hasattr(transcript_list, "find_transcript"):
                    transcript = transcript_list.find_transcript(languages)
            except Exception:
                pass

            if not transcript and hasattr(transcript_list, "__iter__"):
                try:
                    first = next(iter(transcript_list))
                    if hasattr(first, "is_translatable") and first.is_translatable and hasattr(first, "translate"):
                        transcript = first.translate('en')
                    else:
                        transcript = first
                except Exception:
                    pass

            if transcript and hasattr(transcript, "fetch"):
                raw_items = transcript.fetch()
                snippets = getattr(raw_items, "snippets", raw_items)
                items = [_format_snippet(s) for s in snippets]
                items = [i for i in items if i["text"]]
                if items:
                    logger.info(f"[TRANSCRIPT] Extracted {len(items)} items using translation listing for {video_id}")
                    return items
    except Exception as e:
        logger.error(f"[TRANSCRIPT ERROR] All transcript extraction strategies failed for {video_id}: {e}")

    return []


def get_playlist_videos(playlist_url: str) -> list[dict]:
    try:
        match = re.search(r"[?&]list=([a-zA-Z0-9_-]+)", playlist_url)
        if not match:
            return []

        from app.core.config import settings
        api_key = settings.YOUTUBE_API_KEY
        if not api_key:
            logger.warning("[PLAYLIST ERROR] YOUTUBE_API_KEY not configured in settings.")
            return []

        youtube = build(
            "youtube",
            "v3",
            developerKey=api_key
        )

        videos, page_token = [], None

        while True:
            response = youtube.playlistItems().list(
                part="snippet",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=page_token
            ).execute()

            for item in response.get("items", []):
                snippet = item.get("snippet", {})
                video_id = snippet.get("resourceId", {}).get("videoId")
                if video_id:
                    videos.append({
                        "title": snippet.get("title", "Untitled Video"),
                        "url": f"https://www.youtube.com/watch?v={video_id}"
                    })

            page_token = response.get("nextPageToken")
            if not page_token:
                break

        return videos

    except Exception as e:
        logger.error(f"Playlist Error: {e}")
        return []