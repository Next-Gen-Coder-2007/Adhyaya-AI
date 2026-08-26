import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { SUMMARY_PROMPT } from '../prompts/summaryPrompts.js';

export async function generateSummary(moduleContent) {
  if (!moduleContent || !moduleContent.trim()) {
    return {
      summary: '',
      key_takeaways: [],
      resources: [],
    };
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(SUMMARY_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, {
      summary: '',
      key_takeaways: [],
      resources: [],
    });
    return parsed;
  } catch (err) {
    console.error(`[SUMMARY AGENT ERROR] ${err.message}`);
    return {
      summary: '',
      key_takeaways: [],
      resources: [],
    };
  }
}
