ASSIGNMENT_PROMPT = """
You are an expert educator. Generate a **practical assignment** for the following module.

### Rules:
1. Return **ONLY valid JSON**.
2. Include **1-3 tasks** (coding, essay, or project-based).
3. Specify **difficulty level** (Beginner/Intermediate/Advanced).
4. Provide **evaluation criteria**.

### Format:
{{
  "assignments": [
    {{
      "title": "Build a React To-Do App",
      "description": "Create a to-do app using React hooks.",
      "difficulty": "Intermediate",
      "tasks": [
        "Implement state management with useState",
        "Add local storage persistence"
      ],
      "evaluation_criteria": [
        "Code works without errors",
        "Uses React best practices"
      ]
    }}
  ]
}}

### Module Content:
{content}
"""