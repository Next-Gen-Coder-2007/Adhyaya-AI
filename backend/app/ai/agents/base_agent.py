from typing import Optional, Dict, Any
from app.ai.services.llm_service import generate_with_gemini, generate_with_groq
import json
import logging

logger = logging.getLogger(__name__)

class BaseAgent:
    def __init__(
        self,
        provider: str = "groq",
        model: str = "llama-3.3-70b-versatile"
    ):
        self.provider = provider
        self.model = model

        if provider == "gemini":
            self.generate = generate_with_gemini
        else:
            self.generate = generate_with_groq

    def _clean_json(self, text: str) -> str:
        return text.strip().replace("```json", "").replace("```", "").strip()

    def _invoke_llm(
        self,
        prompt: str,
        max_retries: int = 3
    ) -> Optional[Dict[str, Any]]:
        for attempt in range(max_retries):
            try:
                response = self.generate(prompt)
                cleaned = self._clean_json(response)
                return json.loads(cleaned)

            except json.JSONDecodeError as e:
                logger.error(
                    f"JSON Parse Error (Attempt {attempt + 1}/{max_retries}): {e}"
                )
                if attempt == max_retries - 1:
                    return None

            except Exception as e:
                logger.error(
                    f"LLM Error (Attempt {attempt + 1}/{max_retries}): {e}"
                )
                if attempt == max_retries - 1:
                    return None

        return None