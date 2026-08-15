import re
import time
import threading
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_groq_instance = None
_gemini_instance = None
_GROQ_MAX_CONCURRENT = 3
_groq_semaphore = threading.Semaphore(_GROQ_MAX_CONCURRENT)


def get_groq_llm():
    global _groq_instance
    if _groq_instance is None:
        from langchain_groq import ChatGroq
        api_key = settings.GROQ_API_KEY
        if not api_key:
            logger.warning("GROQ_API_KEY not configured in settings")
        _groq_instance = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            api_key=api_key
        )
    return _groq_instance


def get_gemini_llm():
    global _gemini_instance
    if _gemini_instance is None:
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            logger.warning("GOOGLE_API_KEY not configured in settings")
        _gemini_instance = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            google_api_key=api_key
        )
    return _gemini_instance


def parse_retry_after(error_message: str) -> float:
    m = re.search(r'try again in ([\d.]+)s', error_message)
    if m:
        return float(m.group(1)) + 1.0

    m = re.search(r'try again in ([\d.]+)ms', error_message)
    if m:
        return float(m.group(1)) / 1000.0 + 1.0

    return 15.0


def generate_with_gemini(prompt: str, max_retries: int = 4) -> str:
    llm = get_gemini_llm()
    for attempt in range(max_retries):
        try:
            start = time.time()
            response = llm.invoke(prompt).content
            logger.info(f"[GEMINI] Prompt completed in {time.time() - start:.2f}s ({len(prompt)} chars)")
            return response
        except Exception as e:
            error_str = str(e)
            logger.error(f"[GEMINI Error] Attempt {attempt + 1}/{max_retries}: {error_str[:250]}")
            if attempt < max_retries - 1:
                wait_time = parse_retry_after(error_str) if ("429" in error_str or "rate" in error_str.lower()) else 4.0
                time.sleep(wait_time)
            else:
                raise RuntimeError(f"Gemini generation failed after {max_retries} attempts: {error_str[:200]}")


def generate_with_groq(prompt: str, max_retries: int = 5) -> str:
    with _groq_semaphore:
        llm = get_groq_llm()
        start = time.time()

        for attempt in range(max_retries):
            try:
                response = llm.invoke(prompt).content
                logger.info(f"[GROQ] Completed in {time.time() - start:.2f}s ({len(prompt)} chars)")
                return response

            except Exception as e:
                error_str = str(e)
                is_rate_limit = "rate_limit_exceeded" in error_str or "429" in error_str
                logger.warning(f"[GROQ Error] Attempt {attempt + 1}/{max_retries}: {error_str[:250]}")

                if is_rate_limit:
                    if attempt < 2:
                        wait = parse_retry_after(error_str)
                        logger.info(f"Groq Rate limit hit. Waiting {wait:.1f}s...")
                        time.sleep(wait)
                    else:
                        logger.info(f"[FALLBACK] Groq rate limited multiple times -> falling back to Gemini")
                        return generate_with_gemini(prompt)
                else:
                    if attempt < max_retries - 1:
                        time.sleep(3.0)
                    else:
                        logger.info(f"[FALLBACK] Groq error -> falling back to Gemini")
                        return generate_with_gemini(prompt)

        raise RuntimeError("generate_with_groq: exhausted all attempts")