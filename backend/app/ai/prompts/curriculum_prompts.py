COURSE_METADATA_PROMPT = """
You are an expert curriculum planner.

Generate a professional
course title and description.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation

Format:
{{
  "title": "Modern React Development",
  "description": "Learn React from beginner to advanced."
}}

Content:
{content}
"""

MODULE_GENERATION_PROMPT = """
You are an expert curriculum planner.

Generate structured learning modules
from the transcript.

RULES:

1. Cover the ENTIRE chunk duration.
2. Modules must be chronological.
3. No overlaps.
4. No huge gaps.
5. Every module needs:
   - title
   - start_time
   - end_time
6. Module titles should describe
   the actual topic.
7. Keep modules balanced.
8. Use ONLY the provided chunk range.
9. Return ONLY valid JSON.

Expected JSON format:

{{
  "modules": [
    {{
      "title": "Introduction",
      "start_time": 0,
      "end_time": 120
    }}
  ]
}}

Chunk Start:
{chunk_start}

Chunk End:
{chunk_end}

Target Modules:
{target_modules}

Transcript:
{transcript}
"""