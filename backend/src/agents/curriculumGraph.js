import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import { getTranscript, getPlaylistVideos } from '../services/youtubeService.js';
import {
  COURSE_METADATA_PROMPT,
  TIMELINE_OUTLINE_PROMPT,
  SECTION_TITLE_PROMPT,
} from '../prompts/curriculumPrompts.js';
import { generateQuiz } from './quizAgent.js';
import { generateAssignment } from './assignmentAgent.js';
import { generateSummary } from './summaryAgent.js';

function formatSeconds(sec) {
  const total = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function createCondensedTimeline(transcript, totalDuration) {
  if (!transcript || !transcript.length) return '';
  const sampleInterval = totalDuration > 14400 ? 180 : totalDuration > 7200 ? 120 : 60;
  const anchors = [];
  let nextCheckpoint = 0;

  for (const item of transcript) {
    if (item.start >= nextCheckpoint) {
      const timeStr = formatSeconds(item.start);
      const text = item.text.replace(/\n/g, ' ').trim();
      if (text) {
        anchors.push(`[${timeStr}] ${text}`);
      }
      nextCheckpoint = item.start + sampleInterval;
    }
  }

  return anchors.join('\n');
}

function condenseModuleText(transcriptSlice, maxWords = 1000) {
  if (!transcriptSlice || !transcriptSlice.length) return '';
  const fullText = transcriptSlice.map((t) => t.text).join(' ');
  const words = fullText.split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) return fullText;

  const chunkSize = 25;
  const numChunks = Math.floor(maxWords / chunkSize);
  const step = Math.max(1, Math.floor((words.length - chunkSize) / numChunks));
  const condensed = [];

  for (let i = 0; i < numChunks; i++) {
    const startIdx = i * step;
    condensed.push(words.slice(startIdx, startIdx + chunkSize).join(' '));
  }

  return condensed.join(' ... ');
}

// 1. Define LangGraph State Annotation
export const CurriculumState = Annotation.Root({
  title: Annotation(),
  description: Annotation(),
  youtubeUrl: Annotation(),
  isPlaylist: Annotation(),
  transcript: Annotation(),
  totalDuration: Annotation(),
  timelineSummary: Annotation(),
  plannedModules: Annotation(),
  finalModules: Annotation(),
  finalCourse: Annotation(),
  onProgress: Annotation(),
});

// 2. LangGraph Node: Fetch Transcript & Build Timeline Map
async function fetchTranscriptNode(state) {
  const { youtubeUrl, isPlaylist, onProgress } = state;
  if (onProgress) onProgress(10, 'Fetching YouTube video captions & transcript...');

  if (isPlaylist) {
    const videos = await getPlaylistVideos(youtubeUrl);
    return { transcript: [], plannedModules: videos, totalDuration: 0 };
  }

  const transcript = await getTranscript(youtubeUrl);
  if (!transcript || transcript.length === 0) {
    return { transcript: [], totalDuration: 0, timelineSummary: '' };
  }

  const totalDuration = transcript[transcript.length - 1].end;
  const timelineSummary = createCondensedTimeline(transcript, totalDuration);

  if (onProgress) onProgress(20, `Parsed ${formatSeconds(totalDuration)} video timeline. Building structure...`);

  return {
    transcript,
    totalDuration,
    timelineSummary,
  };
}

// 3. LangGraph Node: Synthesize Outline using LangChain
async function synthesizeOutlineNode(state) {
  const { transcript, totalDuration, timelineSummary, isPlaylist, plannedModules, onProgress } = state;
  if (onProgress) onProgress(25, 'Analyzing timeline & synthesizing macro-module outline...');

  if (isPlaylist || !transcript.length) {
    return { plannedModules: plannedModules || [] };
  }

  let targetModules = 3;
  if (totalDuration > 28800) targetModules = 12; // > 8 hrs
  else if (totalDuration > 14400) targetModules = 8; // > 4 hrs
  else if (totalDuration > 7200) targetModules = 6; // > 2 hrs
  else if (totalDuration > 3600) targetModules = 4; // > 1 hr

  const promptTemplate = ChatPromptTemplate.fromTemplate(TIMELINE_OUTLINE_PROMPT);
  const rawOutline = await invokeLangChainPrompt(promptTemplate, {
    total_duration_sec: String(Math.round(totalDuration)),
    duration_formatted: formatSeconds(totalDuration),
    target_modules: String(targetModules),
    timeline_summary: timelineSummary,
  });

  const parsed = parseJsonSafe(rawOutline, { modules: [] });
  let modules = parsed.modules || [];

  if (!modules.length) {
    const sliceSec = totalDuration / targetModules;
    for (let i = 0; i < targetModules; i++) {
      modules.push({
        title: `Module ${i + 1}: Core Concepts & Application`,
        start_time: Math.round(i * sliceSec),
        end_time: Math.round((i + 1) * sliceSec),
      });
    }
  }

  modules.sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
  modules[0].start_time = 0;
  modules[modules.length - 1].end_time = Math.round(totalDuration);

  if (onProgress) onProgress(35, `Structured ${modules.length} learning modules across timeline.`);

  return { plannedModules: modules };
}

// 4. LangGraph Node: Generate Detailed Module Lessons & Assessments
async function generateModuleSectionsNode(state) {
  const { plannedModules, transcript, youtubeUrl, isPlaylist, onProgress } = state;
  const finalModules = [];
  const total = (plannedModules || []).length || 1;

  if (isPlaylist) {
    for (let i = 0; i < (plannedModules || []).length; i++) {
      const v = plannedModules[i];
      const percent = 35 + Math.round(((i + 1) / total) * 50);
      if (onProgress) onProgress(percent, `Synthesizing Playlist Video ${i + 1} of ${total}: "${v.title}"...`);

      const vTranscript = await getTranscript(v.url);
      const vDuration = vTranscript.length ? vTranscript[vTranscript.length - 1].end : 300;

      const mod = {
        title: v.title || `Module ${i + 1}`,
        startTime: 0,
        endTime: Math.round(vDuration * 100) / 100,
        videoUrl: v.url,
      };

      mod.sections = await processModuleWindow(mod, vTranscript, v.url);
      finalModules.push(mod);
    }
    return { finalModules };
  }

  if (!transcript.length) {
    return {
      finalModules: [
        {
          title: 'Full Masterclass & Practice',
          startTime: 0,
          endTime: 3600,
          videoUrl: youtubeUrl,
          sections: [
            { type: 'video', title: 'Video Lesson', startTime: 0, endTime: 3600, content: 'Full Video', completed: false },
            { type: 'quiz', title: 'Quiz Check', content: { quiz: [] }, completed: false },
            { type: 'summary', title: 'Module Summary', content: { summary: '', key_takeaways: [], resources: [] }, completed: false },
          ],
        },
      ],
    };
  }

  for (let i = 0; i < plannedModules.length; i++) {
    const pm = plannedModules[i];
    const s = Math.max(0, parseFloat(pm.start_time ?? 0));
    const e = Math.min(state.totalDuration, parseFloat(pm.end_time ?? state.totalDuration));
    if (e <= s) continue;

    const percent = 35 + Math.round(((i + 1) / total) * 50);
    if (onProgress) onProgress(percent, `Synthesizing Module ${i + 1} of ${total}: "${pm.title || 'Lesson'}" (Quizzes & Labs)...`);

    const mod = {
      title: pm.title || `Module ${i + 1}`,
      startTime: Math.round(s * 100) / 100,
      endTime: Math.round(e * 100) / 100,
      videoUrl: youtubeUrl,
    };

    const slice = transcript.filter((t) => t.start >= s && t.start <= e);
    mod.sections = await processModuleWindow(mod, slice, youtubeUrl);
    finalModules.push(mod);
  }

  return { finalModules };
}

async function processModuleWindow(module, transcriptSlice, youtubeUrl) {
  const moduleDuration = Math.max(60, module.endTime - module.startTime);
  const condensedText = condenseModuleText(transcriptSlice);

  let numSections = 2;
  if (moduleDuration > 3600) numSections = 6;
  else if (moduleDuration > 1800) numSections = 4;
  else if (moduleDuration > 900) numSections = 3;

  const sectionDuration = moduleDuration / numSections;
  const subChunks = [];
  let currentChunk = [];
  let checkpoint = module.startTime + sectionDuration;

  for (const item of transcriptSlice) {
    if (item.start >= module.endTime) break;
    if (item.start >= checkpoint && currentChunk.length) {
      subChunks.push(currentChunk);
      currentChunk = [];
      checkpoint += sectionDuration;
    }
    currentChunk.push(item);
  }
  if (currentChunk.length) subChunks.push(currentChunk);

  // Section titles with LangChain
  const snippets = subChunks.map((chunk, idx) => {
    const sTime = chunk[0]?.start ?? module.startTime;
    const eTime = chunk[chunk.length - 1]?.end ?? module.endTime;
    const text = chunk.map((c) => c.text).join(' ');
    const sample = text.split(/\s+/).slice(0, 25).join(' ');
    return { sample, timeRange: `${formatSeconds(sTime)} - ${formatSeconds(eTime)}` };
  });

  const promptTemplate = ChatPromptTemplate.fromTemplate(SECTION_TITLE_PROMPT);
  const combined = snippets.map((s, idx) => `Section ${idx + 1} (${s.timeRange}): ${s.sample}`).join('\n---\n');

  let titles = [];
  try {
    const rawTitles = await invokeLangChainPrompt(promptTemplate, {
      module_title: module.title,
      num_sections: String(snippets.length),
      content: combined,
    });
    titles = rawTitles
      .split('\n')
      .map((l) => l.trim().replace(/^[-*0-9.)\s]+/, '').replace(/^["']|["']$/g, '').trim())
      .filter(Boolean);
  } catch {
    titles = snippets.map((s, i) => `Lesson Part ${i + 1}`);
  }

  const sections = [];
  for (let i = 0; i < subChunks.length; i++) {
    const chunk = subChunks[i];
    const sTime = chunk[0]?.start ?? module.startTime;
    const eTime = chunk[chunk.length - 1]?.end ?? module.endTime;

    sections.push({
      type: 'video',
      title: titles[i] || `Lesson ${i + 1}`,
      startTime: Math.round(sTime * 100) / 100,
      endTime: Math.round(eTime * 100) / 100,
      content: chunk.map((c) => c.text).join('\n'),
      completed: false,
    });
  }

  // Parallel LangChain assessments
  const [quizData, assignmentData, summaryData] = await Promise.all([
    generateQuiz(condensedText),
    generateAssignment(condensedText),
    generateSummary(condensedText),
  ]);

  sections.push({ type: 'quiz', title: `Quiz: ${module.title}`, content: quizData, completed: false });
  sections.push({ type: 'assignment', title: `Assignment: ${module.title}`, content: assignmentData, completed: false });
  sections.push({ type: 'summary', title: `Summary: ${module.title}`, content: summaryData, completed: false });

  return sections;
}

// 5. LangGraph Node: Generate Metadata & Finalize
async function finalizeCourseNode(state) {
  const { title, description, finalModules, onProgress } = state;
  if (onProgress) onProgress(88, 'Finalizing course metadata & syllabus...');

  const promptTemplate = ChatPromptTemplate.fromTemplate(COURSE_METADATA_PROMPT);
  let finalTitle = title;
  let finalDesc = description;

  try {
    const raw = await invokeLangChainPrompt(promptTemplate, {
      content: JSON.stringify({ title, description }),
    });
    const parsed = parseJsonSafe(raw, {});
    if (parsed.title) finalTitle = parsed.title;
    if (parsed.description) finalDesc = parsed.description;
  } catch {
    // keep default
  }

  return {
    finalCourse: {
      title: finalTitle || 'Interactive Course Track',
      description: finalDesc || 'AI synthesized interactive course track.',
      modules: finalModules,
    },
  };
}

// 6. Build and Compile LangGraph StateGraph Workflow
const workflow = new StateGraph(CurriculumState)
  .addNode('fetchTranscript', fetchTranscriptNode)
  .addNode('synthesizeOutline', synthesizeOutlineNode)
  .addNode('generateModuleSections', generateModuleSectionsNode)
  .addNode('finalizeCourse', finalizeCourseNode)
  .addEdge(START, 'fetchTranscript')
  .addEdge('fetchTranscript', 'synthesizeOutline')
  .addEdge('synthesizeOutline', 'generateModuleSections')
  .addEdge('generateModuleSections', 'finalizeCourse')
  .addEdge('finalizeCourse', END);

export const curriculumGraph = workflow.compile();
