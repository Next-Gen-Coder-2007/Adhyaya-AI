import re
import time
import json
import logging
from typing import Optional, Dict, Any
from app.ai.services.llm_service import generate_with_gemini, generate_with_groq

logger = logging.getLogger(__name__)


def _parse_retry_after(error_message: str) -> float:
    m = re.search(r'try again in ([\d.]+)s', error_message)
    if m:
        return float(m.group(1)) + 1.0
    m = re.search(r'try again in ([\d.]+)ms', error_message)
    if m:
        return float(m.group(1)) / 1000.0 + 1.0
    return 30.0


class BaseAgent:
    def __init__(self, provider: str = "groq", model: str = "llama-3.3-70b-versatile"):
        self.provider = provider
        self.model = model
        self.generate = generate_with_gemini if provider == "gemini" else generate_with_groq

    def _clean_json(self, text: str) -> str:
        return text.strip().replace("```json", "").replace("```", "").strip()

    def _invoke_llm(self, prompt: str, max_retries: int = 8) -> Optional[Dict[str, Any]]:
        for attempt in range(max_retries):
            try:
                response = self.generate(prompt)
                cleaned = self._clean_json(response)
                return json.loads(cleaned)

            except json.JSONDecodeError as e:
                logger.error(f"JSON Parse Error (Attempt {attempt + 1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    return None
                time.sleep(2)

            except Exception as e:
                error_str = str(e)
                logger.error(f"LLM Error (Attempt {attempt + 1}/{max_retries}): {error_str}")
                if attempt == max_retries - 1:
                    return None
                if "rate_limit_exceeded" in error_str or "429" in error_str:
                    wait = _parse_retry_after(error_str)
                    logger.info(f"Rate limited. Waiting {wait:.1f}s...")
                    time.sleep(wait)
                else:
                    time.sleep(5)

        return None
