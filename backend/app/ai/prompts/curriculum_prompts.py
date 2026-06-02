CURRICULUM_PROMPT = """
You are an expert curriculum planner.
Analyze the following YouTube course transcript and create a structured curriculum.

Rules:
- Generate 5 to 12 modules
- Each module should represent a major topic
- Include start and end timestamps (in seconds) for each module
- Keep titles concise and professional
- Return ONLY valid JSON
- Do not add markdown
- Do not explain anything

Return format:
{{
  "modules": [
    {{
      "title": "Introduction to HTML",
      "start_time": 0,
      "end_time": 300
    }}
  ]
}}

Transcript:
{transcript}
"""

COURSE_METADATA_PROMPT = """
You are an expert curriculum planner.
Analyze the following content and generate a concise, professional title and description for the course.

Rules:
- Title should be concise and descriptive
- Description should be 2-3 sentences long
- Return ONLY valid JSON
- Do not add markdown
- Do not explain anything

Return format:
{{
  "title": "Course Title",
  "description": "Course Description"
}}

Content:
{content}

this is the original content that is being analyzed to generate the course title and description. It can be a transcript, playlist information, or any relevant data about the course.
"""