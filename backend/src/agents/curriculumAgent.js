import { curriculumGraph } from './curriculumGraph.js';

export async function generateCourseData(
  title,
  description,
  youtubeUrl,
  isPlaylist = false,
  onProgress = null
) {
  const result = await curriculumGraph.invoke({
    title,
    description,
    youtubeUrl,
    isPlaylist,
    onProgress,
  });

  return result.finalCourse || {
    title: title || 'Interactive Course Track',
    description: description || '',
    modules: result.finalModules || [],
  };
}
