import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import pLimit from 'p-limit';
import { env } from '../config/env.js';
import { generateWithGroq, generateWithGemini, getAvailableGroqModels } from './llmService.js';

let groqChatModel = null;
let geminiChatModel = null;

const limit = pLimit(3);
const outputParser = new StringOutputParser();

function getGeminiApiKey() {
  return env.GOOGLE_API_KEY && env.GOOGLE_API_KEY.startsWith('AIzaSy')
    ? env.GOOGLE_API_KEY
    : env.YOUTUBE_API_KEY && env.YOUTUBE_API_KEY.startsWith('AIzaSy')
    ? env.YOUTUBE_API_KEY
    : env.GOOGLE_API_KEY;
}

export function getLangChainGeminiModel() {
  if (!geminiChatModel) {
    const key = getGeminiApiKey();
    if (key) {
      geminiChatModel = new ChatGoogleGenerativeAI({
        apiKey: key.trim(),
        model: 'gemini-1.5-flash',
        temperature: 0.2,
        maxRetries: 2,
      });
    }
  }
  return geminiChatModel;
}

export async function invokeLangChainPrompt(promptInput, variables = {}) {
  // 1. Build string prompt safely
  let promptText = '';

  if (typeof promptInput === 'string') {
    promptText = promptInput;
    for (const [k, v] of Object.entries(variables)) {
      promptText = promptText.replaceAll(`{${k}}`, String(v));
    }
  } else if (promptInput && typeof promptInput.format === 'function') {
    try {
      promptText = await promptInput.format(variables);
    } catch {
      // Fallback if LangChain template parser encounters unescaped JSON braces
      if (promptInput.template && typeof promptInput.template === 'string') {
        promptText = promptInput.template;
        for (const [k, v] of Object.entries(variables)) {
          promptText = promptText.replaceAll(`{${k}}`, String(v));
        }
      } else {
        promptText = JSON.stringify(variables);
      }
    }
  } else if (promptInput && typeof promptInput === 'object') {
    promptText = JSON.stringify(variables);
  }

  return limit(async () => {
    // Strategy 1: Direct Native Groq (dynamically discovers all active models from Groq API)
    if (env.GROQ_API_KEY) {
      try {
        const result = await generateWithGroq(promptText);
        if (result && result.trim()) return result;
      } catch (err) {
        console.warn(`[NATIVE GROQ WARNING] ${err.message}`);
      }
    }

    // Strategy 2: Direct Native Gemini
    try {
      const result = await generateWithGemini(promptText);
      if (result && result.trim()) return result;
    } catch (err) {
      console.warn(`[NATIVE GEMINI WARNING] ${err.message}`);
    }

    // Strategy 3: LangChain Gemini
    const geminiModel = getLangChainGeminiModel();
    if (geminiModel) {
      try {
        const chain = geminiModel.pipe(outputParser);
        const response = await chain.invoke(promptText);
        if (response && response.trim()) return response;
      } catch (err) {
        console.warn(`[LANGCHAIN GEMINI WARNING] ${err.message}`);
      }
    }

    throw new Error(
      'All AI LLM providers failed. Check GROQ_API_KEY or GOOGLE_API_KEY validity in backend/.env.'
    );
  });
}
