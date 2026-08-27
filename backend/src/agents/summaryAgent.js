import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { SUMMARY_PROMPT } from '../prompts/summaryPrompts.js';

export async function generateSummary(moduleContent) {
  const defaultSummary = {
    summary:
      'This module provided an in-depth exploration of core architectural principles, workflows, and best practices.',
    key_takeaways: [
      'Gained a solid understanding of core concepts and design patterns',
      'Implemented hands-on exercises reinforcing practical execution',
      'Applied industry standards for reliability, modularity, and clean code',
    ],
    resources: [
      {
        title: 'MDN Web Docs & Technical Reference',
        url: 'https://developer.mozilla.org',
        description: 'Comprehensive guides, syntax references, and practical examples',
      },
      {
        title: 'Official Documentation & Standards',
        url: 'https://github.com',
        description: 'Open source examples and architectural guidelines',
      },
    ],
  };

  if (!moduleContent || !moduleContent.trim()) {
    return defaultSummary;
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(SUMMARY_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, null);
    if (parsed && typeof parsed.summary === 'string' && parsed.summary.length > 20) {
      return {
        summary: parsed.summary,
        key_takeaways: parsed.key_takeaways || defaultSummary.key_takeaways,
        resources: parsed.resources || defaultSummary.resources,
      };
    }
    return defaultSummary;
  } catch (err) {
    console.error(`[SUMMARY AGENT ERROR] ${err.message}`);
    return defaultSummary;
  }
}
