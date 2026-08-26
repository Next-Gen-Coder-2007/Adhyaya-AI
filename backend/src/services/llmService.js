import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pLimit from 'p-limit';
import { env } from '../config/env.js';

let groqClient = null;
let geminiClient = null;

const limit = pLimit(3);

const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.6-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

function getGroqClient() {
  if (!groqClient && env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

function getGeminiClient() {
  if (!geminiClient && env.GOOGLE_API_KEY) {
    geminiClient = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
  }
  return geminiClient;
}

export function cleanJsonString(text) {
  if (!text) return '';
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');

  return cleaned.trim();
}

export function parseJsonSafe(text, fallback = null) {
  if (!text) return fallback;
  const cleaned = cleanJsonString(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const repaired = cleaned.replace(/(?<!\\)'/g, '"');
      return JSON.parse(repaired);
    } catch {
      return fallback;
    }
  }
}

function parseRetryAfter(errorMessage) {
  const secMatch = errorMessage.match(/try again in ([\d.]+)s/i);
  if (secMatch) return Math.ceil(parseFloat(secMatch[1]) * 1000) + 1000;

  const msMatch = errorMessage.match(/try again in ([\d.]+)ms/i);
  if (msMatch) return Math.ceil(parseFloat(msMatch[1])) + 1000;

  return 5000;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithGemini(prompt, maxRetries = 3) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Google Gemini API key not configured.');
  }

  const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const modelName of modelCandidates) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch {
      // try next
    }
  }

  throw new Error('All Gemini models failed.');
}

export async function generateWithGroq(prompt, maxRetries = 3) {
  const client = getGroqClient();
  if (!client) {
    return generateWithGemini(prompt);
  }

  return limit(async () => {
    for (const modelName of GROQ_MODELS) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: modelName,
            temperature: 0.2,
          });
          return completion.choices[0]?.message?.content || '';
        } catch (error) {
          const errorMsg = error.message || '';
          const isNotFound = errorMsg.includes('404') || errorMsg.includes('model_not_found');
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('rate_limit');

          if (isNotFound) {
            break;
          }

          if (isRateLimit) {
            if (attempt <= 2) {
              const waitTime = parseRetryAfter(errorMsg);
              await sleep(waitTime);
            } else {
              return generateWithGemini(prompt);
            }
          } else {
            if (attempt < maxRetries) {
              await sleep(2000 * attempt);
            }
          }
        }
      }
    }

    return generateWithGemini(prompt);
  });
}
