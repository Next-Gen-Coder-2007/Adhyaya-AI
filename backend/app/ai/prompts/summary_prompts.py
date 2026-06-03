SUMMARY_PROMPT = """
You are an expert educator. Generate a **summary, key takeaways, and useful resources** for the following module.

### Rules:
1. Return **ONLY valid JSON**.
2. Summary should be **concise** (200-300 words).
3. Include **3-5 key takeaways**.
4. Suggest **2-3 external resources** (links, books, tools).

### Format:
{{
  "summary": "React is a JavaScript library for building user interfaces...",
  "key_takeaways": [
    "React uses a component-based architecture",
    "JSX allows HTML-like syntax in JavaScript"
  ],
  "resources": [
    {{
      "title": "React Official Docs",
      "url": "https://react.dev",
      "description": "Official React documentation"
    }}
  ]
}}

### Module Content:
{content}
"""