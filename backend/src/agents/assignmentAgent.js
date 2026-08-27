import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { ASSIGNMENT_PROMPT } from '../prompts/assignmentPrompts.js';

export async function generateAssignment(moduleContent) {
  const defaultAssignment = {
    assignments: [
      {
        title: 'Practical Implementation Lab',
        description:
          'Construct a working solution implementing the key techniques and architecture patterns introduced in this module.',
        difficulty: 'Intermediate',
        tasks: [
          'Initialize the project workspace and configure environment settings',
          'Implement core logic, state handling, and error boundaries',
          'Test edge cases and verify clean modular execution',
        ],
        starter_code: '// TODO: Implement module logic\nfunction runWorkflow() {\n  // Your code here\n}',
        evaluation_criteria: [
          'Correct implementation of the core concepts',
          'Clean, readable code structure with appropriate error handling',
          'Successful execution across test cases',
        ],
      },
    ],
  };

  if (!moduleContent || !moduleContent.trim()) {
    return defaultAssignment;
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(ASSIGNMENT_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, { assignments: [] });
    if (parsed && Array.isArray(parsed.assignments) && parsed.assignments.length > 0) {
      return parsed;
    }
    return defaultAssignment;
  } catch (err) {
    console.error(`[ASSIGNMENT AGENT ERROR] ${err.message}`);
    return defaultAssignment;
  }
}
