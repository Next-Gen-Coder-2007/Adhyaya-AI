import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let geminiClient = null;
let pineconeClient = null;
let pineconeIndex = null;

function getGeminiApiKey() {
  return env.GOOGLE_API_KEY && env.GOOGLE_API_KEY.startsWith('AIzaSy')
    ? env.GOOGLE_API_KEY
    : env.YOUTUBE_API_KEY && env.YOUTUBE_API_KEY.startsWith('AIzaSy')
    ? env.YOUTUBE_API_KEY
    : env.GOOGLE_API_KEY;
}

function getGeminiClient() {
  if (!geminiClient) {
    const key = getGeminiApiKey();
    if (key) {
      geminiClient = new GoogleGenerativeAI(key.trim());
    }
  }
  return geminiClient;
}

export function getPineconeIndex() {
  if (!env.PINECONE_API_KEY) {
    return null;
  }
  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY.trim(),
      });
    } catch (err) {
      console.error(`[PINECONE CLIENT INIT ERROR] ${err.message}`);
      return null;
    }
  }
  if (!pineconeIndex && pineconeClient) {
    const indexName = env.PINECONE_INDEX || 'adhyaya-ai';
    pineconeIndex = pineconeClient.index(indexName);
  }
  return pineconeIndex;
}

// Lightweight hash-based TF-IDF vectorizer fallback (768 dimensions)
function simpleTfEmbed(text, dim = 768) {
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
  if (!text || !text.trim()) return new Array(768).fill(0);

  const client = getGeminiClient();
  if (client) {
    for (const modelName of ['text-embedding-004', 'embedding-001']) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.embedContent(text);
        if (Array.isArray(result?.embedding?.values) && result.embedding.values.length > 0) {
          const numbers = result.embedding.values.map((v) => (Number.isFinite(v) ? Number(v) : 0));
          if (numbers.length > 0) return numbers;
        }
      } catch {
        // try next model
      }
    }
  }

  return simpleTfEmbed(text, 768);
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

/**
 * Embed all module sections of a course and upsert vectors directly to Pinecone.
 * Each course uses its own namespace (`courseId`) inside the Pinecone Index.
 */
export async function embedCourse(courseId, courseTitle, modules) {
  try {
    const index = getPineconeIndex();
    if (!index) {
      console.warn('[PINECONE] PINECONE_API_KEY not configured. Skipping vector upsert.');
      return;
    }

    const ns = index.namespace(String(courseId));

    // Clear any previous vectors for this course namespace before re-embedding
    try {
      await ns.deleteAll();
    } catch {
      // Namespace might be empty or new, safe to ignore
    }

    const records = [];

    for (let mIdx = 0; mIdx < (modules || []).length; mIdx++) {
      const module = modules[mIdx];
      const moduleTitle = module.title || `Module ${mIdx + 1}`;

      for (let sIdx = 0; sIdx < (module.sections || []).length; sIdx++) {
        const section = module.sections[sIdx];
        const sectionText = extractSectionText(section);

        if (sectionText.split(/\s+/).length < 6) continue;

        const textChunks = chunkText(sectionText);
        for (let cIdx = 0; cIdx < textChunks.length; cIdx++) {
          const text = textChunks[cIdx];
          const rawEmbedding = await embedText(text);
          const embedding = Array.isArray(rawEmbedding) && rawEmbedding.length === 768
            ? rawEmbedding.map((v) => (Number.isFinite(v) ? Number(v) : 0))
            : new Array(768).fill(0);

          records.push({
            id: `${courseId}_m${mIdx}_s${sIdx}_c${cIdx}`,
            values: embedding,
            metadata: {
              courseId: String(courseId),
              moduleId: String(module.id || mIdx),
              sectionId: String(section.id || sIdx),
              text,
              courseTitle: courseTitle || '',
              moduleTitle,
              sectionTitle: section.title || '',
              sectionType: section.type || 'video',
              startTime: Number(section.startTime || section.start_time || 0),
              endTime: Number(section.endTime || section.end_time || 0),
            },
          });
        }
      }
    }

    // Fallback: If no section texts were long enough, create a summary chunk from course & module titles
    if (records.length === 0 && courseTitle) {
      const fallbackText = `${courseTitle}. ${(modules || []).map((m) => m.title || '').filter(Boolean).join('. ')}`;
      const rawEmbedding = await embedText(fallbackText);
      const embedding = Array.isArray(rawEmbedding) && rawEmbedding.length === 768
        ? rawEmbedding.map((v) => (Number.isFinite(v) ? Number(v) : 0))
        : new Array(768).fill(0);

      records.push({
        id: `${courseId}_fallback_0`,
        values: embedding,
        metadata: {
          courseId: String(courseId),
          moduleId: '0',
          sectionId: '0',
          text: fallbackText,
          courseTitle: courseTitle || '',
          moduleTitle: 'Overview',
          sectionTitle: 'Course Summary',
          sectionType: 'summary',
          startTime: 0,
          endTime: 0,
        },
      });
    }

    if (records.length > 0) {
      // Upsert in batches of 100 with Pinecone SDK v8 { records } format
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        if (batch.length > 0) {
          await ns.upsert({ records: batch });
        }
      }
      console.log(`[PINECONE] Successfully indexed ${records.length} chunks for course ${courseId}`);
    }
  } catch (err) {
    console.error(`[PINECONE EMBED ERROR] Failed to embed course ${courseId}: ${err.message}`);
  }
}

/**
 * Retrieve the top relevant course context chunks from Pinecone.
 */
export async function retrieve(courseId, question, topK = 8, scoreThreshold = 0.10) {
  try {
    const index = getPineconeIndex();
    if (!index) {
      console.warn('[PINECONE] PINECONE_API_KEY not configured. Cannot retrieve context.');
      return [];
    }

    const questionEmbedding = await embedText(question);
    const ns = index.namespace(String(courseId));

    const queryResponse = await ns.query({
      vector: questionEmbedding,
      topK,
      includeMetadata: true,
    });

    if (!queryResponse || !queryResponse.matches || !queryResponse.matches.length) {
      return [];
    }

    const scored = queryResponse.matches
      .filter((match) => (match.score ?? 0) >= scoreThreshold)
      .map((match) => ({
        text: match.metadata?.text || '',
        metadata: {
          courseId: match.metadata?.courseId || String(courseId),
          moduleId: match.metadata?.moduleId || '',
          sectionId: match.metadata?.sectionId || '',
          courseTitle: match.metadata?.courseTitle || '',
          moduleTitle: match.metadata?.moduleTitle || '',
          sectionTitle: match.metadata?.sectionTitle || '',
          sectionType: match.metadata?.sectionType || 'video',
          startTime: Number(match.metadata?.startTime || 0),
          endTime: Number(match.metadata?.endTime || 0),
        },
        score: Math.round((match.score ?? 0) * 1000) / 1000,
      }));

    return scored;
  } catch (err) {
    console.error(`[PINECONE RETRIEVE ERROR] Failed to retrieve chunks: ${err.message}`);
    return [];
  }
}

/**
 * Delete all chunk embeddings for a specific course namespace from Pinecone.
 */
export async function deleteCourseEmbeddings(courseId) {
  try {
    const index = getPineconeIndex();
    if (!index) return;
    const ns = index.namespace(String(courseId));
    await ns.deleteAll();
    console.log(`[PINECONE] Purged vectors for course namespace: ${courseId}`);
  } catch (err) {
    console.warn(`[PINECONE DELETE WARNING] ${err.message}`);
  }
}
