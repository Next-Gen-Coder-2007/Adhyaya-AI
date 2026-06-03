QUIZ_PROMPT = """
You are an expert educator. Generate a **quiz** for the following module.

### Rules:
1. Return **ONLY valid JSON**.
2. Generate **5-10 questions** (mix of MCQ, True/False, Short Answer).
3. Include **correct answers** and **explanations**.
4. Questions must be **relevant** to the module content.

### Format:
{{
  "quiz": [
    {{
      "question": "What is React?",
      "type": "MCQ",
      "options": ["A library", "A framework", "A database"],
      "correct_answer": "A library",
      "explanation": "React is a JavaScript library for building UIs."
    }},
    {{
      "question": "Is React a framework?",
      "type": "True/False",
      "correct_answer": "False",
      "explanation": "React is a library, not a framework."
    }}
  ]
}}

### Module Content:
{content}
"""