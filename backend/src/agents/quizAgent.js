import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { QUIZ_PROMPT } from '../prompts/quizPrompts.js';

export async function generateQuiz(moduleContent) {
  if (!moduleContent || !moduleContent.trim()) {
    return { quiz: [] };
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(QUIZ_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, { quiz: [] });
    return parsed.quiz ? parsed : { quiz: [] };
  } catch (err) {
    console.error(`[QUIZ AGENT ERROR] ${err.message}`);
    return { quiz: [] };
  }
}
