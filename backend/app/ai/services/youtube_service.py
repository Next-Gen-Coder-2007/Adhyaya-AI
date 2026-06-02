import re
import os
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build


def is_valid_playlist_url(url: str) -> bool:
    playlist_regex = r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]list=([a-zA-Z0-9_-]+)"
    return bool(re.search(playlist_regex, url))


def extract_video_id(url: str) -> str | None:
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11})"
    match = re.search(regex, url)
    return match.group(1) if match else None

def get_transcript(url: str) -> str:
    try:
        video_id = extract_video_id(url)

        if not video_id:
            return ""

        api = YouTubeTranscriptApi()

        transcript = api.fetch(video_id)

        final_text = " ".join(
            [item.text for item in transcript]
        )

        return final_text

    except Exception as e:
        print(f"Transcript Error: {e}")
        return ""


def get_playlist_videos(playlist_url: str) -> list[dict]:
    try:
        if not is_valid_playlist_url(playlist_url):
            print("Invalid playlist URL")
            return []

        match = re.search(r"[?&]list=([a-zA-Z0-9_-]+)", playlist_url)

        if not match:
            print("Playlist ID not found")
            return []

        playlist_id = match.group(1)

        api_key = os.getenv("YOUTUBE_API_KEY")

        if not api_key:
            print("YOUTUBE_API_KEY missing")
            return []

        youtube = build(
            "youtube",
            "v3",
            developerKey=api_key
        )

        videos = []
        next_page_token = None

        while True:
            request = youtube.playlistItems().list(
                part="snippet",
                playlistId=playlist_id,
                maxResults=50,
                pageToken=next_page_token
            )

            response = request.execute()

            for item in response.get("items", []):

                snippet = item.get("snippet", {})

                resource_id = snippet.get("resourceId", {})

                video_id = resource_id.get("videoId")

                if not video_id:
                    continue

                videos.append({
                    "title": snippet.get("title"),
                    "url": f"https://www.youtube.com/watch?v={video_id}"
                })

            next_page_token = response.get("nextPageToken")

            if not next_page_token:
                break

        return videos

    except Exception as e:
        print(f"Playlist Fetch Error: {e}")
        return []