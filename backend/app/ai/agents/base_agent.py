import re
import time
import json
import logging
from typing import Optional, Dict, Any
from app.ai.services.llm_service import generate_with_gemini, generate_with_groq

logger = logging.getLogger(__name__)


def _clean_json_string(text: str) -> str:
    """Robustly cleans and repairs common LLM JSON syntax errors."""
    if not text:
        return ""

    # 1. Strip markdown fences like ```json ... ```
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*```$', '', cleaned)

    # 2. Extract JSON block if surrounded by conversational filler
    json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', cleaned)
    if json_match:
        cleaned = json_match.group(1)

    # 3. Remove trailing commas before closing braces/brackets: `, }` -> `}` or `, ]` -> `]`
    cleaned = re.sub(r',\s*([\}\]])', r'\1', cleaned)

    return cleaned.strip()


class BaseAgent:
    def __init__(self, provider: str = "groq", model: str = "llama-3.3-70b-versatile"):
        self.provider = provider
        self.model = model
        self.generate = generate_with_gemini if provider == "gemini" else generate_with_groq

    def _clean_json(self, text: str) -> str:
        return _clean_json_string(text)

    def _invoke_llm(self, prompt: str, max_retries: int = 5) -> Optional[Dict[str, Any]]:
        for attempt in range(max_retries):
            try:
                response = self.generate(prompt)
                cleaned = self._clean_json(response)
                return json.loads(cleaned)

            except json.JSONDecodeError as e:
                logger.error(f"JSON Parse Error (Attempt {attempt + 1}/{max_retries}): {e}")
                # Try fallback repair if needed
                try:
                    # Replace single quotes with double quotes if standard JSON failed
                    repaired = re.sub(r"(?<!\\)'", '"', cleaned)
                    return json.loads(repaired)
                except Exception:
                    pass

                if attempt == max_retries - 1:
                    logger.error(f"Failed to parse JSON response: {response[:300]}")
                    return None
                time.sleep(1.5)

            except Exception as e:
                logger.error(f"LLM Invocation Error (Attempt {attempt + 1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    return None
                time.sleep(2.0)

        return None
