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
  const contextChunks = await retrieve(courseId, question, 5, 0.25);
  return { contextChunks };
}

async function generateAnswerNode(state) {
  const { question, history, courseTitle, moduleTitles, contextChunks } = state;

  const modulesList = (moduleTitles || []).map((t) => `"${t}"`).join(', ') || 'multiple modules';

  const formattedChunks = (contextChunks || [])
    .map((c) => {
      const meta = c.metadata || {};
      const mod = meta.moduleTitle || 'Unknown Module';
      const sec = meta.sectionType || 'content';
      const timeStr = formatTimestamp(meta.startTime);
      const timeLabel = timeStr ? ` @ [${timeStr}]` : '';
      return `[${mod} › ${sec}${timeLabel}] (relevance=${c.score})\n${c.text}`;
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

  const systemTemplate = `You are an expert AI Tutor inside Adhyaya AI.
The student is studying the course: "{course_title}".
Available modules: {modules_list}

Instructions:
- Answer strictly and accurately using the retrieved course context.
- Whenever referencing specific moments in a video, format timestamps explicitly as \`[MM:SS]\` (or \`[HH:MM:SS]\` for long tutorials) so the learner can click to jump directly to that timestamp in the video.
- Mention the module name whenever referencing information.
- Keep responses concise, structured, educational, and easy to understand with bullet points or code snippets where appropriate.
- If the answer is not present in the context, respond helpfully with:
"That specific topic isn't covered in the retrieved course material. Try revisiting [suggest the most relevant module name]."

=== RETRIEVED CONTEXT ===
{context_chunks}

=== CONVERSATION HISTORY ===
{history_lines}

=== STUDENT QUESTION ===
{student_question}

=== TUTOR ANSWER ===`;

  const promptTemplate = ChatPromptTemplate.fromTemplate(systemTemplate);

  try {
    const answer = await invokeLangChainPrompt(promptTemplate, {
      course_title: courseTitle || 'this course',
      modules_list: modulesList,
      context_chunks: formattedChunks || 'No relevant context found.',
      history_lines: historyLines || '(start of conversation)',
      student_question: question,
    });

    const sourcesSet = new Set();
    for (const c of contextChunks || []) {
      const title = c.metadata?.moduleTitle;
      if (title) sourcesSet.add(title);
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
