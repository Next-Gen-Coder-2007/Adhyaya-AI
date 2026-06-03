from app.ai.agents.base_agent import BaseAgent
from app.ai.prompts.summary_prompts import SUMMARY_PROMPT
from typing import Dict, Any

class SummaryAgent(BaseAgent):
    def __init__(self):
        super().__init__(provider="groq")

    def generate_summary(self, module_content: str) -> Dict[str, Any]:
        prompt = SUMMARY_PROMPT.format(content=module_content)
        result = self._invoke_llm(prompt)
        return result if result else {
            "summary": "",
            "key_takeaways": [],
            "resources": []
        }