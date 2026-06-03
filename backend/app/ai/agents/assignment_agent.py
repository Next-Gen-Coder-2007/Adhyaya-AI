from app.ai.agents.base_agent import BaseAgent
from app.ai.prompts.assignment_prompts import ASSIGNMENT_PROMPT
from typing import Dict, List

class AssignmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(provider="groq")

    def generate_assignment(self, module_content: str) -> Dict[str, List[Dict]]:
        prompt = ASSIGNMENT_PROMPT.format(content=module_content)
        result = self._invoke_llm(prompt)
        return result if result else {"assignments": []}