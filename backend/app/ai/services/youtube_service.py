import re

from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound
)


def extract_video_id(url: str):

    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"

    match = re.search(regex, url)

    if match:
        return match.group(1)

    return None


def get_transcript(url: str):

    try:

        video_id = extract_video_id(url)

        api = YouTubeTranscriptApi()

        transcript = api.fetch(video_id)

        final_text = " ".join(
            [item.text for item in transcript]
        )

        return final_text

    except Exception as e:

        print(str(e))

        return ""