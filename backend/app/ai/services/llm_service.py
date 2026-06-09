import os
import re
import time
import threading
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

load_dotenv()

gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

groq_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    api_key=os.getenv("GROQ_API_KEY")
)

_GROQ_MAX_CONCURRENT = 2
_groq_semaphore = threading.Semaphore(_GROQ_MAX_CONCURRENT)


def parse_retry_after(error_message: str) -> float:
    m = re.search(r'try again in ([\d.]+)s', error_message)
    if m:
        return float(m.group(1)) + 1.0

    m = re.search(r'try again in ([\d.]+)ms', error_message)
    if m:
        return float(m.group(1)) / 1000.0 + 1.0

    return 30.0


def _safe_invoke(llm, prompt: str, retries: int = 8, delay: int = 5) -> str:
    for attempt in range(retries):
        try:
            return llm.invoke(prompt).content
        except Exception as e:
            error_str = str(e)
            print(f"\nLLM Error (Attempt {attempt + 1}/{retries})")
            print(error_str[:300])
            if attempt < retries - 1:
                if "rate_limit_exceeded" in error_str or "429" in error_str:
                    wait = parse_retry_after(error_str)
                    print(f"Rate limited. Waiting {wait:.1f}s...\n")
                    time.sleep(wait)
                else:
                    print(f"Retrying in {delay}s...\n")
                    time.sleep(delay)
            else:
                raise Exception(f"LLM failed after {retries} retries: {error_str[:200]}")


def generate_with_gemini(prompt: str) -> str:
    print(f"[GEMINI CALL] Generating (Prompt length: {len(prompt)} chars)")
    start = time.time()
    response = _safe_invoke(gemini_llm, prompt)
    print(f"[GEMINI CALL] Response received in {time.time() - start:.2f}s")
    return response


def generate_with_groq(prompt: str) -> str:
    with _groq_semaphore:
        print(f"[GROQ CALL] Generating (Prompt length: {len(prompt)} chars)")
        start = time.time()

        for attempt in range(8):
            try:
                response = groq_llm.invoke(prompt).content
                print(f"[GROQ CALL] Response received in {time.time() - start:.2f}s")
                return response

            except Exception as e:
                error_str = str(e)
                is_rate_limit = "rate_limit_exceeded" in error_str or "429" in error_str

                print(f"\nLLM Error (Attempt {attempt + 1}/8)")
                print(error_str[:300])

                if is_rate_limit:
                    if attempt < 2:
                        wait = parse_retry_after(error_str)
                        print(f"Rate limited. Waiting {wait:.1f}s (Groq header)...\n")
                        time.sleep(wait)
                    else:
                        print(f"[FALLBACK] Groq rate limited {attempt + 1} times — switching to Gemini\n")
                        return generate_with_gemini(prompt)
                else:
                    if attempt < 7:
                        time.sleep(5)
                    else:
                        raise Exception(f"Groq failed after 8 retries: {error_str[:200]}")

        raise Exception("generate_with_groq: exhausted all attempts")