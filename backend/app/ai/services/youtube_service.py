import os
import re
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build


def is_valid_playlist_url(url: str) -> bool:
    return bool(re.search(r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]list=([a-zA-Z0-9_-]+)", url))


def extract_video_id(url: str) -> str | None:
    match = re.search(
        r"(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})",
        url
    )
    return match.group(1) if match else None


def get_transcript(url: str) -> list[dict]:
    video_id = extract_video_id(url)
    if not video_id:
        return []

    # 1. Try standard get_transcript with priority language list
    try:
        raw_items = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=['en', 'en-US', 'en-GB', 'en-CA', 'en-IN', 'hi', 'es', 'fr', 'de']
        )
        return [
            {
                "text": item.get("text", "").strip(),
                "start": round(float(item.get("start", 0)), 2),
                "end": round(float(item.get("start", 0)) + float(item.get("duration", 0)), 2)
            }
            for item in raw_items
            if item.get("text", "").strip()
        ]
    except Exception as e1:
        print(f"[TRANSCRIPT] Standard fetch failed for {video_id}: {e1}. Trying transcript listing fallback...")

    # 2. Try listing all transcripts and finding any available (auto-generated or manual)
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        # Try to find English first, else first available
        try:
            transcript = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
        except Exception:
            # Pick first available generated or manual transcript and translate to English
            try:
                first_transcript = next(iter(transcript_list))
                transcript = first_transcript.translate('en') if first_transcript.is_translatable else first_transcript
            except Exception:
                transcript = next(iter(transcript_list))

        raw_items = transcript.fetch()
        return [
            {
                "text": item.get("text", "").strip(),
                "start": round(float(item.get("start", 0)), 2),
                "end": round(float(item.get("start", 0)) + float(item.get("duration", 0)), 2)
            }
            for item in raw_items
            if item.get("text", "").strip()
        ]
    except Exception as e2:
        print(f"[TRANSCRIPT ERROR] All transcript extraction methods failed for {video_id}: {e2}")
        return []


def get_playlist_videos(playlist_url: str) -> list[dict]:
    try:
        match = re.search(r"[?&]list=([a-zA-Z0-9_-]+)", playlist_url)
        if not match:
            return []

        playlist_id = match.group(1)

        api_key = os.getenv("YOUTUBE_API_KEY")
        if not api_key:
            print("[PLAYLIST ERROR] YOUTUBE_API_KEY not set in environment.")
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
        print(f"Playlist Error: {e}")
        return []