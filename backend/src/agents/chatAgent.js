import { ragGraph } from './ragGraph.js';

export async function chatWithRAG({
  courseId,
  question,
  history = [],
  courseTitle = 'this course',
  moduleTitles = [],
}) {
  const result = await ragGraph.invoke({
    courseId,
    question,
    history,
    courseTitle,
    moduleTitles,
  });

  return {
    answer: result.answer,
    sources: result.sources || [],
  };
}
