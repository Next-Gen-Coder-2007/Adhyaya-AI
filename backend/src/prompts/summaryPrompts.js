export const SUMMARY_PROMPT = `You are an expert educator. Generate a concise summary, key takeaways, and curated learning resources for the following module.

### Rules:
1. Return ONLY valid JSON.
2. Summary should be structured and concise (150-250 words).
3. Provide 3-5 "key_takeaways" bullet points.
4. Suggest 2-3 "resources" (title, url, description).
5. No markdown fences.

### Format:
{{
  "summary": "This module introduces core component concepts...",
  "key_takeaways": [
    "Components encapsulate UI logic and state",
    "Props enable uni-directional data flow from parent to child",
    "Hooks manage side effects and component lifecycle"
  ],
  "resources": [
    {{
      "title": "React Official Documentation",
      "url": "https://react.dev",
      "description": "Comprehensive reference and interactive examples"
    }}
  ]
}}

### Module Content:
{content}`;
