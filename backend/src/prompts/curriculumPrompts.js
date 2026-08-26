export const COURSE_METADATA_PROMPT = `You are an expert curriculum planner.

Generate a professional course title and description based on the provided content.

Rules:
- Return ONLY valid JSON
- No markdown, no triple backticks, no conversational filler
- Keys required: "title", "description"

Format:
{{
  "title": "Modern React Development",
  "description": "Learn React from beginner to advanced concepts with practical exercises."
}}

Content:
{content}`;

export const TIMELINE_OUTLINE_PROMPT = `You are an expert curriculum architect.

Given a condensed timeline outline of a video (Total Duration: {total_duration_sec}s / {duration_formatted}), organize this content into {target_modules} logical, chronological, high-level learning modules.

CRITICAL RULES:
1. Cover the ENTIRE duration from 0 to {total_duration_sec}.
2. Modules MUST be strictly chronological with no overlapping time ranges and no large gaps.
3. Every module MUST have:
   - "title": A descriptive, professional topic title (max 7 words).
   - "start_time": Exact start timestamp in seconds (integer or float).
   - "end_time": Exact end timestamp in seconds (integer or float).
4. The first module must start at 0. The last module must end at {total_duration_sec}.
5. Return ONLY valid JSON. No markdown fences.

Expected JSON schema:
{{
  "modules": [
    {{
      "title": "Introduction & Setup",
      "start_time": 0,
      "end_time": 600
    }}
  ]
}}

Condensed Timeline:
{timeline_summary}`;

export const SECTION_TITLE_PROMPT = `You are an expert educational content creator.

Generate EXACTLY {num_sections} concise lesson/section titles for the following transcript sections within the module "{module_title}".
Return ONLY the titles, one per line, in the exact same order as the sections.
Do NOT include numbers, bullet points, quotes, or markdown.

RULES:
- Maximum 8 words per title
- Sound like structured video lessons
- Describe the specific concept taught
- Avoid generic names like "Section 1", "Overview", "Introduction"

MODULE TITLE: {module_title}
NUMBER OF SECTIONS: {num_sections}

SECTIONS CONTENT:
{content}`;
