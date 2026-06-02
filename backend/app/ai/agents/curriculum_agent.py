import json

from langchain_core.prompts import (
    ChatPromptTemplate
)

from app.ai.services.llm_service import llm

from app.ai.prompts.curriculum_prompt import (
    CURRICULUM_PROMPT
)


def generate_modules(transcript: str):

    prompt = ChatPromptTemplate.from_template(
        CURRICULUM_PROMPT
    )

    chain = prompt | llm

    response = chain.invoke({
        "transcript": transcript[:15000]
    })

    try:
        return json.loads(response.content)

    except:
        return {
            "modules": []
        }