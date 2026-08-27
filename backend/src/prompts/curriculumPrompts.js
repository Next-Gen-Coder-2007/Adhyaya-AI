export const COURSE_METADATA_PROMPT = `You are an expert curriculum planner.

Generate a professional, engaging course title and comprehensive description based on the provided video information and syllabus.

Rules:
- Return ONLY valid JSON
- No markdown, no triple backticks, no conversational filler
- Keys required: "title", "description"

Format:
{{
  "title": "Modern React & Next.js Full Stack Mastery",
  "description": "Comprehensive masterclass covering architecture, state management, full-stack API integration, and production deployment."
}}

Content:
{content}`;

export const TIMELINE_OUTLINE_PROMPT = `You are an expert curriculum architect.

Given a timeline outline of a video course (Total Duration: {total_duration_sec}s / {duration_formatted}), organize this entire course into {target_modules} logical, chronological, high-level learning modules.

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
      "title": "Introduction & Environment Setup",
      "start_time": 0,
      "end_time": 1800
    }}
  ]
}}

Video Syllabus & Timeline:
{timeline_summary}`;

export const METADATA_OUTLINE_PROMPT = `You are an expert curriculum architect.

Given the course title, description, duration ({total_duration_sec}s / {duration_formatted}), and video chapters, organize this complete curriculum into {target_modules} comprehensive, chronological learning modules covering the full duration from 0 to {total_duration_sec}s.

CRITICAL RULES:
1. Divide the total duration from 0 to {total_duration_sec} into {target_modules} progressive modules.
2. If chapters are provided, align module boundaries to the chapters.
3. Every module MUST have:
   - "title": Clear, professional topic title (max 7 words).
   - "start_time": Start timestamp in seconds (integer).
   - "end_time": End timestamp in seconds (integer).
4. The first module starts at 0. The last module ends at {total_duration_sec}.
5. Return ONLY valid JSON. No markdown fences.

Expected JSON schema:
{{
  "modules": [
    {{
      "title": "Module 1: Foundations & Core Concepts",
      "start_time": 0,
      "end_time": 1800
    }}
  ]
}}

Course Details:
{course_details}`;

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

export const COMPLETE_MODULE_SYNTHESIS_PROMPT = `You are an elite educational AI course creator.

Synthesize a comprehensive, high-quality learning package for the module: "{module_title}" (Duration: {duration_formatted}).
You will generate:
1. Exactly {num_sections} lesson/video sub-section titles.
2. A 4-6 question interactive quiz (MCQ, True/False, Short Answer) with explanations.
3. A hands-on practical assignment / coding lab with tasks, starter code, and evaluation criteria.
4. An executive summary with 3-5 key takeaways and curated resources.

RULES:
- Return ONLY valid JSON. No markdown code blocks, no backticks.
- All quiz options must be plausible, and correct_answer must strictly match one of the options for MCQ/True-False.
- The assignment must be practical, actionable, and aligned with the module topic.

Expected JSON Schema:
{{
  "section_titles": [
    "Setting Up Development Tooling",
    "Understanding Core Architecture"
  ],
  "quiz": [
    {{
      "question": "What is the primary architectural purpose of this concept?",
      "type": "MCQ",
      "options": ["To optimize state management", "To handle asynchronous network calls", "To configure routing endpoints", "To compile static assets"],
      "correct_answer": "To optimize state management",
      "explanation": "State management optimization ensures predictable data flow across components."
    }},
    {{
      "question": "Is this pattern suitable for distributed production environments?",
      "type": "True/False",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "This pattern provides scalability and fault tolerance in distributed systems."
    }}
  ],
  "assignments": [
    {{
      "title": "Practical Lab: Implementing Core Workflow",
      "description": "Construct a working solution reinforcing the key techniques introduced in this module.",
      "difficulty": "Intermediate",
      "tasks": [
        "Initialize project structure and configure environment variables",
        "Implement data flow logic and error boundaries",
        "Test edge cases and optimize execution time"
      ],
      "starter_code": "// TODO: Implement handler logic\\nfunction executeWorkflow() {\\n  // Your code here\\n}",
      "evaluation_criteria": [
        "Code runs without uncaught exceptions",
        "Meets performance and clean code standards",
        "Handles edge cases and input validation"
      ]
    }}
  ],
  "summary": "This module provided an in-depth exploration of core principles, best practices, and practical implementation patterns.",
  "key_takeaways": [
    "Mastered key architectural patterns and lifecycle methods",
    "Implemented clean data flows with resilient error handling",
    "Applied industry best practices for performance and scalability"
  ],
  "resources": [
    {{
      "title": "Official Technical Documentation & Guides",
      "url": "https://developer.mozilla.org",
      "description": "Comprehensive reference manual and API documentation"
    }}
  ]
}}

Module Context:
{content}`;
