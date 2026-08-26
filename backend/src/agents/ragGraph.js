import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { retrieve } from '../services/embeddingService.js';
import { invokeLangChainPrompt } from '../services/langchainService.js';

function formatTimestamp(value) {
  if (value === undefined || value === null || value === '') return '';
  const totalSeconds = parseInt(value, 10);
  if (isNaN(totalSeconds)) return '';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const RagState = Annotation.Root({
  courseId: Annotation(),
  question: Annotation(),
  history: Annotation(),
  courseTitle: Annotation(),
  moduleTitles: Annotation(),
  contextChunks: Annotation(),
  answer: Annotation(),
  sources: Annotation(),
});

async function retrieveChunksNode(state) {
  const { courseId, question } = state;
  // Retrieve top 8 chunks with an accessible threshold (0.10)
  const contextChunks = await retrieve(courseId, question, 8, 0.10);
  return { contextChunks };
}

async function generateAnswerNode(state) {
  const { question, history, courseTitle, moduleTitles, contextChunks } = state;

  const modulesList = (moduleTitles || []).map((t) => `"${t}"`).join(', ') || 'Course curriculum modules';

  const formattedChunks = (contextChunks || [])
    .map((c) => {
      const meta = c.metadata || {};
      const mod = meta.moduleTitle || 'Module';
      const sec = meta.sectionType || 'Lesson';
      const timeStr = formatTimestamp(meta.startTime);
      const timeLabel = timeStr ? ` @ [${timeStr}]` : '';
      return `[${mod} › ${sec}${timeLabel}]\n${c.text}`;
    })
    .join('\n\n---\n\n');

  const historyLines = (history || [])
    .slice(-6)
    .map((item) => {
      const role = item.role === 'user' ? 'Student' : 'Tutor';
      const text = (item.content || '').trim();
      return text ? `${role}: ${text}` : '';
    })
    .filter(Boolean)
    .join('\n');

  const systemTemplate = `You are an elite, highly knowledgeable AI Master Tutor and Senior Educator inside Adhyaya AI.
You are assisting a student learning the course: "{course_title}".
Course Modules: {modules_list}

YOUR INSTRUCTIONAL CAPABILITIES & BEHAVIORS:
1. Pedagogical Excellence:
   - When the student asks for practice questions or quizzes (e.g. "Generate 3 practice quiz questions"), IMMEDIATELY generate high-quality, practical multiple-choice or conceptual questions with answer choices, correct answers, and clear explanations grounded in the subject matter.
   - When asked to summarize or explain, break down complex ideas into crystal-clear explanations with analogies, bullet points, and real-world examples.
   - When asked for code, provide clean, idiomatic, fully functional code snippets with helpful comments.
2. Grounding & Video Timestamps:
   - Draw heavily from the retrieved course context.
   - Whenever referring to specific video moments or timestamps from the context, format them explicitly as \`[MM:SS]\` (e.g. \`[03:45]\` or \`[01:15:30]\`) so the student can click them to navigate directly to that part of the video.
   - Reference the relevant module name when discussing specific topics.
3. Tone & Formatting:
   - Write with clarity, warmth, and educational authority.
   - Use structured Markdown formatting with bold keywords, numbered lists, bullet points, and syntax-highlighted code blocks (\`\`\`html, \`\`\`javascript, etc.).
   - NEVER give dry refusals like "topic isn't covered". Always provide a helpful, comprehensive, pedagogical answer that educates the student while connecting back to the course concepts.

=== RETRIEVED COURSE CONTEXT ===
{context_chunks}

=== CONVERSATION HISTORY ===
{history_lines}

=== STUDENT INQUIRY ===
{student_question}

=== TUTOR RESPONSE ===`;

  const promptTemplate = ChatPromptTemplate.fromTemplate(systemTemplate);

  try {
    const answer = await invokeLangChainPrompt(promptTemplate, {
      course_title: courseTitle || 'this course',
      modules_list: modulesList,
      context_chunks: formattedChunks || 'Grounded in overall course curriculum and educational domain knowledge.',
      history_lines: historyLines || '(start of conversation)',
      student_question: question,
    });

    const sourcesSet = new Set();
    for (const c of contextChunks || []) {
      const title = c.metadata?.moduleTitle;
      if (title) sourcesSet.add(title);
    }
    if (sourcesSet.size === 0 && (moduleTitles || []).length > 0) {
      sourcesSet.add(moduleTitles[0]);
    }

    return {
      answer: answer.trim(),
      sources: Array.from(sourcesSet),
    };
  } catch (err) {
    console.error(`[RAG GRAPH ERROR] ${err.message}`);
    return {
      answer: 'Sorry, I encountered an issue generating your response. Please try again.',
      sources: [],
    };
  }
}

const ragWorkflow = new StateGraph(RagState)
  .addNode('retrieveChunks', retrieveChunksNode)
  .addNode('generateAnswer', generateAnswerNode)
  .addEdge(START, 'retrieveChunks')
  .addEdge('retrieveChunks', 'generateAnswer')
  .addEdge('generateAnswer', END);

export const ragGraph = ragWorkflow.compile();
