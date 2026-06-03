from app.ai.agents.base_agent import BaseAgent
from app.ai.prompts.quiz_prompts import QUIZ_PROMPT
from typing import Dict, List

class QuizAgent(BaseAgent):
    def __init__(self):
        super().__init__(provider="groq")

    def generate_quiz(self, module_content: str) -> Dict[str, List[Dict]]:
        prompt = QUIZ_PROMPT.format(content=module_content)
        result = self._invoke_llm(prompt)
        return result if result else {"quiz": []}