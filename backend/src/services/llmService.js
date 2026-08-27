import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pLimit from 'p-limit';
import { env } from '../config/env.js';

let groqClient = null;
let geminiClient = null;
let discoveredGroqModels = null;

const limit = pLimit(3);

function getGroqClient() {
  if (!groqClient && env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY.trim() });
  }
  return groqClient;
}

function getGeminiClient() {
  if (!geminiClient) {
    const key =
      env.GOOGLE_API_KEY && env.GOOGLE_API_KEY.startsWith('AIzaSy')
        ? env.GOOGLE_API_KEY
        : env.YOUTUBE_API_KEY && env.YOUTUBE_API_KEY.startsWith('AIzaSy')
        ? env.YOUTUBE_API_KEY
        : env.GOOGLE_API_KEY;

    if (key) {
      geminiClient = new GoogleGenerativeAI(key.trim());
    }
  }
  return geminiClient;
}

export async function getAvailableGroqModels() {
  if (discoveredGroqModels && discoveredGroqModels.length > 0) {
    return discoveredGroqModels;
  }
  const client = getGroqClient();
  if (!client) return [];

  try {
    const listRes = await client.models.list();
    const active = (listRes.data || [])
      .filter((m) => m.active !== false && !m.id.includes('whisper'))
      .map((m) => m.id);

    if (active.length > 0) {
      discoveredGroqModels = active;
      console.log('[GROQ ACTIVE MODELS DISCOVERED]', discoveredGroqModels);
      return discoveredGroqModels;
    }
  } catch (err) {
    console.warn(`[GROQ MODEL LIST FETCH WARNING] ${err.message}`);
  }

  return [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ];
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

  return 3000;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithGemini(prompt, maxRetries = 2) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Google Gemini API key not configured or blocked.');
  }

  const modelCandidates = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const modelName of modelCandidates) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) return text;
      } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          await sleep(2000 * attempt);
        } else {
          break; // Try next model candidate
        }
      }
    }
  }

  throw new Error('All Gemini models failed.');
}

export async function generateWithGroq(prompt, maxRetries = 2) {
  const client = getGroqClient();
  if (!client) {
    return generateWithGemini(prompt);
  }

  const models = await getAvailableGroqModels();

  return limit(async () => {
    for (const modelName of models) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: modelName,
            temperature: 0.2,
          });
          const text = completion.choices[0]?.message?.content || '';
          if (text && text.trim()) return text;
        } catch (error) {
          const errorMsg = error.message || '';
          const isNotFound =
            errorMsg.includes('404') ||
            errorMsg.includes('model_not_found') ||
            errorMsg.includes('model_decommissioned') ||
            errorMsg.includes('decommissioned');
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('rate_limit');

          if (isNotFound) {
            // Model decommissioned or not supported, skip immediately to next model
            break;
          }

          if (isRateLimit) {
            if (attempt <= 1) {
              const waitTime = parseRetryAfter(errorMsg);
              await sleep(waitTime);
            } else {
              break; // Try next model in candidate list
            }
          } else {
            console.warn(`[GROQ ${modelName} ERROR] ${errorMsg}`);
            if (attempt < maxRetries) {
              await sleep(1500 * attempt);
            }
          }
        }
      }
    }

    // Fallback to Gemini if all Groq models failed
    return generateWithGemini(prompt);
  });
}
