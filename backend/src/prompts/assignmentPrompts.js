export const ASSIGNMENT_PROMPT = `You are an expert educator. Generate a practical, hands-on assignment for the following module.

### Rules:
1. Return ONLY valid JSON.
2. Include 1-3 actionable tasks (coding challenge, project, or exercise).
3. Specify "difficulty" (Beginner, Intermediate, or Advanced).
4. Provide clear "evaluation_criteria".
5. No markdown fences.

### Format:
{{
  "assignments": [
    {{
      "title": "Build a Responsive Navigation Bar",
      "description": "Implement a fully responsive navbar component using modern CSS Flexbox and React hooks.",
      "difficulty": "Intermediate",
      "tasks": [
        "Create hamburger menu toggle for mobile viewports",
        "Add smooth transition effects on link hover",
        "Handle active navigation state"
      ],
      "evaluation_criteria": [
        "Code functions correctly across screen sizes",
        "Adheres to accessibility standards",
        "Follows clean component separation"
      ]
    }}
  ]
}}

### Module Content:
{content}`;
