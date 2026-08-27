import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeLangChainPrompt } from '../services/langchainService.js';
import { parseJsonSafe } from '../services/llmService.js';
import {
  getTranscript,
  getPlaylistVideos,
  getVideoMetadata,
} from '../services/youtubeService.js';
import {
  COURSE_METADATA_PROMPT,
  TIMELINE_OUTLINE_PROMPT,
  METADATA_OUTLINE_PROMPT,
  COMPLETE_MODULE_SYNTHESIS_PROMPT,
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

function createCondensedTimeline(transcript, totalDuration, chapters = []) {
  const anchors = [];

  // If description has chapters, include them prominently in the timeline anchors
  if (chapters && chapters.length > 0) {
    anchors.push('=== Official Video Chapters ===');
    for (const ch of chapters) {
      anchors.push(`[${formatSeconds(ch.start)}] ${ch.title}`);
    }
    anchors.push('=== Transcript Timeline Highlights ===');
  }

  if (transcript && transcript.length > 0) {
    const sampleInterval =
      totalDuration > 36000 ? 300 : totalDuration > 18000 ? 180 : totalDuration > 7200 ? 120 : 60;
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
  }

  return anchors.join('\n');
}

function createMetadataTimeline(videoDetails) {
  const parts = [];
  parts.push(`Video Title: ${videoDetails.title || 'Course'}`);
  parts.push(`Total Duration: ${formatSeconds(videoDetails.durationSec)} (${videoDetails.durationSec}s)`);

  if (videoDetails.chapters && videoDetails.chapters.length > 0) {
    parts.push('\nIdentified Syllabus Chapters:');
    for (const ch of videoDetails.chapters) {
      parts.push(`- [${formatSeconds(ch.start)} - ${formatSeconds(ch.end)}] ${ch.title}`);
    }
  }

  if (videoDetails.description) {
    const cleanDesc = videoDetails.description
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('http') && !l.includes('subscribe'))
      .slice(0, 40)
      .join('\n');
    parts.push(`\nDescription Overview:\n${cleanDesc}`);
  }

  return parts.join('\n');
}

function condenseModuleText(transcriptSlice, maxWords = 800) {
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
  videoDetails: Annotation(),
  transcript: Annotation(),
  totalDuration: Annotation(),
  timelineSummary: Annotation(),
  plannedModules: Annotation(),
  finalModules: Annotation(),
  finalCourse: Annotation(),
  onProgress: Annotation(),
});

// 2. LangGraph Node: Fetch Video Metadata, Chapters, & Transcript
async function fetchTranscriptNode(state) {
  const { youtubeUrl, isPlaylist, onProgress } = state;
  if (onProgress) onProgress(10, 'Fetching YouTube video metadata & chapters...');

  if (isPlaylist) {
    const videos = await getPlaylistVideos(youtubeUrl);
    return {
      transcript: [],
      plannedModules: videos,
      totalDuration: 0,
      videoDetails: { title: state.title || 'Playlist Track', durationSec: 0 },
    };
  }

  // Fetch full video details (title, description, duration, chapters)
  const videoDetails = await getVideoMetadata(youtubeUrl);
  if (onProgress) onProgress(18, 'Extracting video captions & transcript stream...');

  // Fetch multi-tier transcript
  const transcript = await getTranscript(youtubeUrl);

  let totalDuration = videoDetails.durationSec || 3600;
  if (transcript && transcript.length > 0) {
    const lastEnd = transcript[transcript.length - 1].end;
    if (lastEnd > 0) {
      totalDuration = Math.max(totalDuration, lastEnd);
    }
  }

  const timelineSummary =
    transcript && transcript.length > 0
      ? createCondensedTimeline(transcript, totalDuration, videoDetails.chapters)
      : createMetadataTimeline(videoDetails);

  if (onProgress)
    onProgress(
      25,
      `Analyzed ${formatSeconds(totalDuration)} timeline (${transcript.length ? transcript.length + ' captions' : videoDetails.chapters.length + ' chapters'})...`
    );

  return {
    videoDetails,
    transcript: transcript || [],
    totalDuration,
    timelineSummary,
  };
}

// 3. LangGraph Node: Synthesize Outline using LangChain
async function synthesizeOutlineNode(state) {
  const {
    transcript,
    totalDuration,
    timelineSummary,
    videoDetails,
    isPlaylist,
    plannedModules,
    onProgress,
  } = state;

  if (onProgress) onProgress(30, 'Synthesizing module outline & learning milestones...');

  if (isPlaylist || (plannedModules && plannedModules.length > 0)) {
    return { plannedModules: plannedModules || [] };
  }

  // Target modules scale according to course duration
  let targetModules = 3;
  if (totalDuration >= 36000) targetModules = 10; // >= 10 hrs
  else if (totalDuration >= 21600) targetModules = 8; // >= 6 hrs
  else if (totalDuration >= 14400) targetModules = 6; // >= 4 hrs
  else if (totalDuration >= 7200) targetModules = 5; // >= 2 hrs
  else if (totalDuration >= 3600) targetModules = 4; // >= 1 hr

  // If video description has clear chapters (e.g. 4 to 15 chapters), map them to modules!
  if (videoDetails?.chapters && videoDetails.chapters.length >= 3) {
    const chs = videoDetails.chapters;
    let modules = [];

    if (chs.length <= targetModules + 3) {
      // Direct chapter-to-module mapping
      modules = chs.map((ch, idx) => ({
        title: ch.title || `Module ${idx + 1}: Key Topics`,
        start_time: Math.round(ch.start),
        end_time: Math.round(ch.end),
      }));
    } else {
      // Group dense chapters into targetModules blocks
      const chunkSize = Math.ceil(chs.length / targetModules);
      for (let i = 0; i < chs.length; i += chunkSize) {
        const group = chs.slice(i, i + chunkSize);
        const sTime = group[0].start;
        const eTime = group[group.length - 1].end;
        const groupTitle = group[0].title;
        modules.push({
          title: groupTitle || `Module ${modules.length + 1}`,
          start_time: Math.round(sTime),
          end_time: Math.round(eTime),
        });
      }
    }

    if (modules.length > 0) {
      modules.sort((a, b) => a.start_time - b.start_time);
      modules[0].start_time = 0;
      modules[modules.length - 1].end_time = Math.round(totalDuration);

      if (onProgress)
        onProgress(38, `Mapped ${modules.length} syllabus modules from video chapters.`);

      return { plannedModules: modules };
    }
  }

  // LLM Synthesis Outline
  let modules = [];
  try {
    const promptTemplate = transcript?.length
      ? ChatPromptTemplate.fromTemplate(TIMELINE_OUTLINE_PROMPT)
      : ChatPromptTemplate.fromTemplate(METADATA_OUTLINE_PROMPT);

    const variables = transcript?.length
      ? {
          total_duration_sec: String(Math.round(totalDuration)),
          duration_formatted: formatSeconds(totalDuration),
          target_modules: String(targetModules),
          timeline_summary: timelineSummary,
        }
      : {
          total_duration_sec: String(Math.round(totalDuration)),
          duration_formatted: formatSeconds(totalDuration),
          target_modules: String(targetModules),
          course_details: timelineSummary,
        };

    const rawOutline = await invokeLangChainPrompt(promptTemplate, variables);
    const parsed = parseJsonSafe(rawOutline, { modules: [] });
    modules = parsed.modules || [];
  } catch {
    modules = [];
  }

  // Fallback if LLM returned empty outline
  if (!modules.length) {
    const sliceSec = totalDuration / targetModules;
    const defaultTopicNames = [
      'Foundations, Tooling & Setup',
      'Core Architecture & Fundamentals',
      'Deep Dive & Advanced Concepts',
      'Real-World Patterns & Workflows',
      'Integration, APIs & Data Flow',
      'Performance Optimization & Testing',
      'Comprehensive Project Implementation',
      'Deployment, Production & Best Practices',
    ];

    for (let i = 0; i < targetModules; i++) {
      const topic =
        defaultTopicNames[i % defaultTopicNames.length] || `Module ${i + 1}: In-Depth Practice`;
      modules.push({
        title: `Module ${i + 1}: ${topic}`,
        start_time: Math.round(i * sliceSec),
        end_time: Math.round((i + 1) * sliceSec),
      });
    }
  }

  modules.sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
  modules[0].start_time = 0;
  modules[modules.length - 1].end_time = Math.round(totalDuration);

  // Eliminate any internal gaps
  for (let i = 0; i < modules.length - 1; i++) {
    if (modules[i].end_time !== modules[i + 1].start_time) {
      modules[i + 1].start_time = modules[i].end_time;
    }
  }

  if (onProgress)
    onProgress(40, `Structured ${modules.length} modules across ${formatSeconds(totalDuration)}.`);

  return { plannedModules: modules };
}

// 4. LangGraph Node: Generate Detailed Module Lessons & Assessments
async function generateModuleSectionsNode(state) {
  const { plannedModules, transcript, youtubeUrl, isPlaylist, videoDetails, onProgress } = state;
  const finalModules = [];
  const total = (plannedModules || []).length || 1;

  if (isPlaylist) {
    for (let i = 0; i < (plannedModules || []).length; i++) {
      const v = plannedModules[i];
      const percent = 40 + Math.round(((i + 1) / total) * 45);
      if (onProgress)
        onProgress(percent, `Synthesizing Playlist Video ${i + 1} of ${total}: "${v.title}"...`);

      const vTranscript = await getTranscript(v.url);
      const vDetails = await getVideoMetadata(v.url);
      const vDuration = vTranscript.length
        ? vTranscript[vTranscript.length - 1].end
        : vDetails.durationSec || 600;

      const mod = {
        title: v.title || `Module ${i + 1}`,
        startTime: 0,
        endTime: Math.round(vDuration * 100) / 100,
        videoUrl: v.url,
      };

      mod.sections = await processModuleWindow(mod, vTranscript, v.url, vDetails, state.title);
      finalModules.push(mod);
    }
    return { finalModules };
  }

  // Single Course Video (e.g. 5hr / 10hr)
  for (let i = 0; i < plannedModules.length; i++) {
    const pm = plannedModules[i];
    const s = Math.max(0, parseFloat(pm.start_time ?? 0));
    const e = Math.min(state.totalDuration, parseFloat(pm.end_time ?? state.totalDuration));
    if (e <= s) continue;

    const percent = 40 + Math.round(((i + 1) / total) * 45);
    if (onProgress)
      onProgress(
        percent,
        `Synthesizing Module ${i + 1} of ${total}: "${pm.title || 'Lesson'}" (Lessons, Quizzes & Labs)...`
      );

    const mod = {
      title: pm.title || `Module ${i + 1}`,
      startTime: Math.round(s * 100) / 100,
      endTime: Math.round(e * 100) / 100,
      videoUrl: youtubeUrl,
    };

    const slice = (transcript || []).filter((t) => t.start >= s && t.start <= e);
    mod.sections = await processModuleWindow(
      mod,
      slice,
      youtubeUrl,
      videoDetails,
      state.title || videoDetails?.title
    );
    finalModules.push(mod);
  }

  return { finalModules };
}

async function processModuleWindow(module, transcriptSlice, youtubeUrl, videoDetails, courseTitle) {
  const moduleDuration = Math.max(60, module.endTime - module.startTime);
  const condensedText =
    transcriptSlice && transcriptSlice.length
      ? condenseModuleText(transcriptSlice, 900)
      : `Course: ${courseTitle || 'Masterclass'}\nModule: ${module.title}\nTime: ${formatSeconds(module.startTime)} to ${formatSeconds(module.endTime)}\nOverview: Comprehensive video lesson covering practical implementations and theoretical fundamentals.`;

  // Determine number of video lecture subsections
  let numSections = 2;
  if (moduleDuration >= 3600) numSections = 4;
  else if (moduleDuration >= 1800) numSections = 3;

  const sectionDuration = moduleDuration / numSections;
  const subChunks = [];

  if (transcriptSlice && transcriptSlice.length > 0) {
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
  }

  // Ensure subChunks count aligns with numSections
  while (subChunks.length < numSections) {
    const idx = subChunks.length;
    const sTime = module.startTime + idx * sectionDuration;
    const eTime = Math.min(module.endTime, sTime + sectionDuration);
    subChunks.push([
      {
        start: sTime,
        end: eTime,
        text: `Key concepts for ${module.title} Part ${idx + 1}`,
      },
    ]);
  }

  // Fast single-pass unified module synthesis
  let synthResult = null;
  try {
    const promptTemplate = ChatPromptTemplate.fromTemplate(
      COMPLETE_MODULE_SYNTHESIS_PROMPT
    );
    const rawSynth = await invokeLangChainPrompt(promptTemplate, {
      module_title: module.title,
      duration_formatted: formatSeconds(moduleDuration),
      num_sections: String(subChunks.length),
      content: condensedText,
    });
    synthResult = parseJsonSafe(rawSynth, null);
  } catch {
    synthResult = null;
  }

  // Extract titles or fallback
  let titles = [];
  if (synthResult?.section_titles && Array.isArray(synthResult.section_titles)) {
    titles = synthResult.section_titles;
  }

  if (!titles.length) {
    try {
      const titlePrompt = ChatPromptTemplate.fromTemplate(SECTION_TITLE_PROMPT);
      const rawTitles = await invokeLangChainPrompt(titlePrompt, {
        module_title: module.title,
        num_sections: String(subChunks.length),
        content: condensedText,
      });
      titles = rawTitles
        .split('\n')
        .map((l) => l.trim().replace(/^[-*0-9.)\s]+/, '').replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
    } catch {
      titles = subChunks.map((_, i) => `Part ${i + 1}: Concept Breakdown & Application`);
    }
  }

  // Build video lecture sections
  const sections = [];
  for (let i = 0; i < subChunks.length; i++) {
    const chunk = subChunks[i];
    const sTime = chunk[0]?.start ?? module.startTime + i * sectionDuration;
    const eTime =
      chunk[chunk.length - 1]?.end ??
      Math.min(module.endTime, sTime + sectionDuration);

    const title = titles[i] || `Part ${i + 1}: Core Mechanics & Techniques`;
    const snippetText = chunk.map((c) => c.text).join('\n');

    sections.push({
      type: 'video',
      title,
      startTime: Math.round(sTime * 100) / 100,
      endTime: Math.round(eTime * 100) / 100,
      content: snippetText || `Detailed lesson on ${title}`,
      completed: false,
    });
  }

  // Build Quiz Data
  let quizData = { quiz: [] };
  if (synthResult?.quiz && Array.isArray(synthResult.quiz) && synthResult.quiz.length > 0) {
    quizData = { quiz: synthResult.quiz };
  } else {
    try {
      quizData = await generateQuiz(condensedText);
    } catch {
      quizData = { quiz: [] };
    }
  }

  if (!quizData.quiz || quizData.quiz.length === 0) {
    quizData = {
      quiz: [
        {
          question: `What is the primary concept covered in ${module.title}?`,
          type: 'MCQ',
          options: [
            'Core architecture and practical application',
            'Configuring legacy build tools',
            'Unrelated syntax styles',
            'Third-party deployment hooks',
          ],
          correct_answer: 'Core architecture and practical application',
          explanation: `This module focuses on understanding core architecture and practical implementation patterns in ${module.title}.`,
        },
        {
          question: `Can the techniques in ${module.title} be applied to scalable production projects?`,
          type: 'True/False',
          options: ['True', 'False'],
          correct_answer: 'True',
          explanation: 'These principles are designed for scalability, maintainability, and clean architecture.',
        },
      ],
    };
  }

  // Build Assignment Data
  let assignmentData = { assignments: [] };
  if (
    synthResult?.assignments &&
    Array.isArray(synthResult.assignments) &&
    synthResult.assignments.length > 0
  ) {
    assignmentData = { assignments: synthResult.assignments };
  } else {
    try {
      assignmentData = await generateAssignment(condensedText);
    } catch {
      assignmentData = { assignments: [] };
    }
  }

  if (!assignmentData.assignments || assignmentData.assignments.length === 0) {
    assignmentData = {
      assignments: [
        {
          title: `Hands-on Lab: ${module.title}`,
          description: `Implement the key architecture patterns demonstrated in this module.`,
          difficulty: 'Intermediate',
          tasks: [
            'Set up the component/module structure',
            'Implement the core logic and state management',
            'Validate error handling and test edge cases',
          ],
          evaluation_criteria: [
            'Clean, readable code structure',
            'Correct implementation of the core concepts',
            'Proper error handling',
          ],
        },
      ],
    };
  }

  // Build Summary Data
  let summaryData = { summary: '', key_takeaways: [], resources: [] };
  if (synthResult?.summary && typeof synthResult.summary === 'string' && synthResult.summary.length > 20) {
    summaryData = {
      summary: synthResult.summary,
      key_takeaways: synthResult.key_takeaways || [
        `Mastered core techniques in ${module.title}`,
        'Built practical understanding through real-world examples',
        'Reinforced patterns through interactive exercises',
      ],
      resources: synthResult.resources || [
        {
          title: 'Official Documentation & Guides',
          url: 'https://developer.mozilla.org',
          description: 'Reference material and comprehensive guides',
        },
      ],
    };
  } else {
    try {
      summaryData = await generateSummary(condensedText);
    } catch {
      summaryData = {
        summary: `This module covered essential concepts, patterns, and practical techniques in ${module.title}.`,
        key_takeaways: [
          `Gained proficiency in ${module.title}`,
          'Implemented hands-on exercises and reinforced key patterns',
        ],
        resources: [
          {
            title: 'Technical Reference Manual',
            url: 'https://developer.mozilla.org',
            description: 'Comprehensive documentation and best practices',
          },
        ],
      };
    }
  }

  sections.push({
    type: 'quiz',
    title: `Quiz: ${module.title}`,
    content: quizData,
    completed: false,
  });

  sections.push({
    type: 'assignment',
    title: `Assignment: ${module.title}`,
    content: assignmentData,
    completed: false,
  });

  sections.push({
    type: 'summary',
    title: `Summary: ${module.title}`,
    content: summaryData,
    completed: false,
  });

  return sections;
}

// 5. LangGraph Node: Generate Metadata & Finalize
async function finalizeCourseNode(state) {
  const { title, description, finalModules, videoDetails, onProgress } = state;
  if (onProgress) onProgress(92, 'Finalizing course syllabus and metadata...');

  let finalTitle = title;
  let finalDesc = description;

  if (
    (!finalTitle || finalTitle === 'Interactive Course Track') &&
    videoDetails?.title
  ) {
    finalTitle = videoDetails.title;
  }

  if (!finalDesc && videoDetails?.description) {
    finalDesc = videoDetails.description.slice(0, 300);
  }

  try {
    const promptTemplate = ChatPromptTemplate.fromTemplate(COURSE_METADATA_PROMPT);
    const raw = await invokeLangChainPrompt(promptTemplate, {
      content: JSON.stringify({
        title: finalTitle,
        description: finalDesc,
        moduleCount: finalModules.length,
        modules: finalModules.map((m) => m.title),
      }),
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
      imageUrl: videoDetails?.thumbnailUrl || null,
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
