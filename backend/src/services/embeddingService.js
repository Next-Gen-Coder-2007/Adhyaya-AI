import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chunk } from '../models/Chunk.js';
import { env } from '../config/env.js';

let geminiClient = null;

function getGeminiClient() {
  if (!geminiClient && env.GOOGLE_API_KEY) {
    geminiClient = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
  }
  return geminiClient;
}

// Lightweight hash-based TF-IDF vectorizer fallback (0MB RAM, no external deps, zero prototype pollution)
function simpleTfEmbed(text, dim = 128) {
  const tokens = (text.toLowerCase().match(/\w+/g) || []);
  const vec = new Array(dim).fill(0);
  if (!tokens.length) return vec;

  const counts = new Map();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }

  for (const [token, count] of counts.entries()) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += Number(count) || 0;
  }

  const norm = Math.sqrt(vec.reduce((sum, val) => sum + (Number(val) || 0) ** 2, 0));
  return norm > 0 ? vec.map((val) => Number((val / norm).toFixed(6)) || 0) : vec;
}

export async function embedText(text) {
  if (!text || !text.trim()) return new Array(128).fill(0);

  const client = getGeminiClient();
  if (client) {
    for (const modelName of ['embedding-001', 'text-embedding-004']) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.embedContent(text);
        if (Array.isArray(result?.embedding?.values) && result.embedding.values.length > 0) {
          const numbers = result.embedding.values.map((v) => (Number.isFinite(v) ? Number(v) : 0));
          if (numbers.length > 0) return numbers;
        }
      } catch {
        // try next
      }
    }
  }

  return simpleTfEmbed(text);
}

export function cosineSimilarity(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  let dot = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  if (norm1 > 0 && norm2 > 0) {
    return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
  return 0;
}

export function chunkText(text, targetWords = 150, overlapSentences = 2) {
  if (!text) return [];
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!sentences.length) return [];

  const chunks = [];
  let currentChunk = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;

    if (currentChunk.length && currentWords + sentenceWords > targetWords) {
      chunks.push(currentChunk.join(' '));
      currentChunk = currentChunk.slice(-overlapSentences);
      currentWords = currentChunk.reduce((acc, s) => acc + s.split(/\s+/).length, 0);
    }

    currentChunk.push(sentence);
    currentWords += sentenceWords;
  }

  if (currentChunk.length) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

function extractSectionText(section) {
  const parts = [];
  if (section.title) parts.push(section.title);

  const content = section.content;
  if (typeof content === 'string') {
    parts.push(content);
  } else if (content && typeof content === 'object') {
    if (content.summary) parts.push(content.summary);
    if (Array.isArray(content.key_takeaways)) {
      parts.push(content.key_takeaways.join('. '));
    }
    if (Array.isArray(content.assignments)) {
      content.assignments.forEach((a) => {
        if (a.title) parts.push(a.title);
        if (a.description) parts.push(a.description);
      });
    }
    if (Array.isArray(content.quiz)) {
      content.quiz.forEach((q) => {
        if (q.question) parts.push(q.question);
        if (q.explanation) parts.push(q.explanation);
      });
    }
  }

  return parts.join(' ').trim();
}

export async function embedCourse(courseId, courseTitle, modules) {
  try {
    // Remove prior chunks for this course
    await Chunk.deleteMany({ courseId });

    const chunkDocs = [];

    for (let mIdx = 0; mIdx < (modules || []).length; mIdx++) {
      const module = modules[mIdx];
      const moduleTitle = module.title || `Module ${mIdx + 1}`;

      for (let sIdx = 0; sIdx < (module.sections || []).length; sIdx++) {
        const section = module.sections[sIdx];
        const sectionText = extractSectionText(section);

        if (sectionText.split(/\s+/).length < 6) continue;

        const textChunks = chunkText(sectionText);
        for (const text of textChunks) {
          const rawEmbedding = await embedText(text);
          const embedding = Array.isArray(rawEmbedding)
            ? rawEmbedding.map((v) => (Number.isFinite(v) ? Number(v) : 0))
            : new Array(128).fill(0);

          chunkDocs.push({
            courseId,
            moduleId: module.id || String(mIdx),
            sectionId: section.id || String(sIdx),
            text,
            embedding,
            metadata: {
              courseTitle: courseTitle || '',
              moduleTitle,
              sectionTitle: section.title || '',
              sectionType: section.type || 'video',
              startTime: section.startTime || section.start_time || 0,
              endTime: section.endTime || section.end_time || 0,
            },
          });
        }
      }
    }

    if (chunkDocs.length > 0) {
      await Chunk.insertMany(chunkDocs);
    }
  } catch (err) {
    console.error(`[EMBEDDING ERROR] Failed to embed course ${courseId}: ${err.message}`);
  }
}

export async function retrieve(courseId, question, topK = 5, scoreThreshold = 0.25) {
  try {
    const questionEmbedding = await embedText(question);
    const chunks = await Chunk.find({ courseId }).lean();

    if (!chunks || !chunks.length) return [];

    const scored = [];
    for (const chunk of chunks) {
      const sim = cosineSimilarity(questionEmbedding, chunk.embedding);
      if (sim >= scoreThreshold) {
        scored.push({
          text: chunk.text,
          metadata: chunk.metadata,
          score: Math.round(sim * 1000) / 1000,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  } catch (err) {
    console.error(`[RETRIEVE ERROR] Failed to retrieve chunks: ${err.message}`);
    return [];
  }
}

export async function deleteCourseEmbeddings(courseId) {
  try {
    await Chunk.deleteMany({ courseId });
  } catch (err) {
    console.warn(`[EMBEDDING DELETE WARNING] ${err.message}`);
  }
}
