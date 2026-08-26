import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import pLimit from 'p-limit';
import { env } from '../config/env.js';

let groqChatModel = null;
let geminiChatModel = null;

const limit = pLimit(3);
const outputParser = new StringOutputParser();

export function getLangChainGroqModel() {
  if (!groqChatModel && env.GROQ_API_KEY) {
    groqChatModel = new ChatGroq({
      apiKey: env.GROQ_API_KEY,
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      maxRetries: 2,
    });
  }
  return groqChatModel;
}

export function getLangChainGeminiModel() {
  if (!geminiChatModel && env.GOOGLE_API_KEY) {
    geminiChatModel = new ChatGoogleGenerativeAI({
      apiKey: env.GOOGLE_API_KEY,
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      maxRetries: 2,
    });
  }
  return geminiChatModel;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryAfter(errorMessage) {
  const secMatch = errorMessage.match(/try again in ([\d.]+)s/i);
  if (secMatch) return Math.ceil(parseFloat(secMatch[1]) * 1000) + 1000;

  const msMatch = errorMessage.match(/try again in ([\d.]+)ms/i);
  if (msMatch) return Math.ceil(parseFloat(msMatch[1])) + 1000;

  return 4000;
}

export async function invokeLangChainPrompt(promptTemplate, variables) {
  const groqModel = getLangChainGroqModel();
  const geminiModel = getLangChainGeminiModel();

  return limit(async () => {
    // 1. Try LangChain ChatGroq first
    if (groqModel) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const chain = promptTemplate.pipe(groqModel).pipe(outputParser);
          const response = await chain.invoke(variables);
          return response;
        } catch (err) {
          const errMsg = err.message || '';
          const isRateLimit = errMsg.includes('429') || errMsg.includes('rate_limit');

          if (isRateLimit && attempt <= 2) {
            const waitTime = parseRetryAfter(errMsg);
            await sleep(waitTime);
          } else {
            break; // Switch to Gemini
          }
        }
      }
    }

    // 2. Fallback to LangChain ChatGoogleGenerativeAI
    if (geminiModel) {
      const chain = promptTemplate.pipe(geminiModel).pipe(outputParser);
      const response = await chain.invoke(variables);
      return response;
    }

    throw new Error('No LangChain LLM providers configured (check GROQ_API_KEY and GOOGLE_API_KEY).');
  });
}
