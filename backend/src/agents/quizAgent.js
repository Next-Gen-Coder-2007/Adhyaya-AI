import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { QUIZ_PROMPT } from '../prompts/quizPrompts.js';

export async function generateQuiz(moduleContent) {
  const defaultQuiz = {
    quiz: [
      {
        question: 'What is the primary concept and application taught in this lesson?',
        type: 'MCQ',
        options: [
          'Core architectural patterns and execution workflows',
          'Configuring unsupported legacy build scripts',
          'Alternative runtime environments without compilation',
          'Third-party deployment hooks without authentication',
        ],
        correct_answer: 'Core architectural patterns and execution workflows',
        explanation:
          'This module emphasizes understanding foundational principles, design patterns, and practical execution.',
      },
      {
        question: 'Can the techniques covered in this module be applied in production systems?',
        type: 'True/False',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation:
          'These patterns are engineered for scalability, clean separation of concerns, and production resilience.',
      },
    ],
  };

  if (!moduleContent || !moduleContent.trim()) {
    return defaultQuiz;
  }

  const promptTemplate = ChatPromptTemplate.fromTemplate(QUIZ_PROMPT);
  try {
    const raw = await invokeLangChainPrompt(promptTemplate, { content: moduleContent });
    const parsed = parseJsonSafe(raw, { quiz: [] });
    if (parsed && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) {
      return parsed;
    }
    return defaultQuiz;
  } catch (err) {
    console.error(`[QUIZ AGENT ERROR] ${err.message}`);
    return defaultQuiz;
  }
}
