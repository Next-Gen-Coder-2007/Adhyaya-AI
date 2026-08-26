export const QUIZ_PROMPT = `You are an expert educator. Generate an interactive quiz assessing key concepts from the following module content.

### Rules:
1. Return ONLY valid JSON.
2. Generate 4-8 high-quality questions (mix of MCQ and True/False).
3. Include clear "options", "correct_answer", and an educational "explanation".
4. Questions must strictly test facts and code taught in the content.
5. No markdown fences.

### Format:
{{
  "quiz": [
    {{
      "question": "What is the primary function of useState in React?",
      "type": "MCQ",
      "options": ["To declare state variables in functional components", "To manage global routing", "To connect to external databases"],
      "correct_answer": "To declare state variables in functional components",
      "explanation": "useState is a React Hook that allows you to add state variables to functional components."
    }},
    {{
      "question": "Does JSX execute directly inside native web browsers without transpilation?",
      "type": "True/False",
      "options": ["True", "False"],
      "correct_answer": "False",
      "explanation": "JSX must be transpiled by tools like Babel or Vite into standard JavaScript before browsers can execute it."
    }}
  ]
}}

### Module Content:
{content}`;
