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
    try:
        video_id = extract_video_id(url)
        if not video_id:
            return []

        api = YouTubeTranscriptApi()
        snippets = api.fetch(video_id).snippets

        return [{
            "text": s.text,
            "start": s.start,
            "end": s.start + s.duration
        } for s in snippets]

    except Exception as e:
        print(f"Transcript Error: {e}")
        return []


def get_playlist_videos(playlist_url: str) -> list[dict]:
    try:
        match = re.search(r"[?&]list=([a-zA-Z0-9_-]+)", playlist_url)
        if not match:
            return []

        playlist_id = match.group(1)

        youtube = build(
            "youtube",
            "v3",
            developerKey=os.getenv("YOUTUBE_API_KEY")
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
                        "title": snippet.get("title"),
                        "url": f"https://www.youtube.com/watch?v={video_id}"
                    })

            page_token = response.get("nextPageToken")
            if not page_token:
                break

        return videos

    except Exception as e:
        print(f"Playlist Error: {e}")
        return []