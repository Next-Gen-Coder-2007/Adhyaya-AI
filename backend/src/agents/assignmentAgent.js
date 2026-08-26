import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { ASSIGNMENT_PROMPT } from '../prompts/assignmentPrompts.js';

export async function generateAssignment(moduleContent) {
  if (!moduleContent || !moduleContent.trim()) {
    return { assignments: [] };
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(ASSIGNMENT_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, { assignments: [] });
    return parsed.assignments ? parsed : { assignments: [] };
  } catch (err) {
    console.error(`[ASSIGNMENT AGENT ERROR] ${err.message}`);
    return { assignments: [] };
  }
}
