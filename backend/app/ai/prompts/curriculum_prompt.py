CURRICULUM_PROMPT = """
You are an expert curriculum planner.

Analyze the following YouTube course transcript and create a structured curriculum.

Rules:
- Generate 5 to 12 modules
- Each module should represent a major topic
- Keep titles concise and professional
- Return ONLY valid JSON
- Do not add markdown
- Do not explain anything

Return format:

{{
  "modules": [
    {{
      "title": "Introduction to HTML"
    }},
    {{
      "title": "HTML Tags and Elements"
    }}
  ]
}}

Transcript:
{transcript}
"""