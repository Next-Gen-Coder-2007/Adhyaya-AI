import os
import time
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


def safe_invoke(llm, prompt, retries=8, delay=5):
    for attempt in range(retries):
        try:
            return llm.invoke(prompt).content
        except Exception as e:
            print(f"\nLLM Error (Attempt {attempt + 1}/{retries})")
            print(str(e))
            if attempt < retries - 1:
                print(f"Retrying in {delay}s...\n")
                time.sleep(delay)
            else:
                raise Exception(f"LLM failed after {retries} retries")


def generate_with_gemini(prompt: str):
    return safe_invoke(gemini_llm, prompt)


def generate_with_groq(prompt: str):
    return safe_invoke(groq_llm, prompt)