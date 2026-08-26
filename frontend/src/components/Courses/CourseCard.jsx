import { useState } from 'react';
import { PlayCircle, CheckCircle, Sparkles, Film, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useCourseProgress } from '../../hooks/useCourseProgress';

export const getCourseThumbnail = (course) => {
  if (course?.image_url && !course.image_url.includes('/vi/default/')) return course.image_url;
  if (course?.imageUrl && !course.imageUrl.includes('/vi/default/')) return course.imageUrl;
  const rawUrl = course?.video_url || course?.youtube_url || course?.videoUrl || course?.modules?.[0]?.video_url || '';
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
};

const CourseCard = ({ course, onClick, onCourseUpdated }) => {
  const [retrying, setRetrying] = useState(false);

  const allSections = course.modules?.flatMap((m) => m.sections || []) || [];
  const totalSections = allSections.length;
  const completedSections = allSections.filter((s) => s.completed).length;
  const studyProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  const isGenerating = course.status === 'generating';
  const isFailed = course.status === 'failed';
  const errorMsg = course.error_message || course.errorMessage || 'Transcript or captions unavailable for this video.';

  const thumbnail = getCourseThumbnail(course);

  // Pure client-side progress simulation (zero DB/API calls)
  const { progress: genProgress, step: genStep } = useCourseProgress(
    course.status,
    course.created_at || course.createdAt
  );

  const handleRetry = async (e) => {
    e.stopPropagation();
    if (retrying) return;
    try {
      setRetrying(true);
      await api.post(`/courses/${course.id || course._id}/retry`);
      if (onCourseUpdated) {
        await onCourseUpdated();
      }
    } catch (err) {
      console.error('Failed to retry course generation:', err);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      onClick={isGenerating || isFailed ? undefined : onClick}
      className={`group rounded-3xl bg-zinc-950/90 border border-zinc-900 overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between ${
        isGenerating || isFailed
          ? 'cursor-default'
          : 'hover:border-amber-500/40 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer'
      }`}
    >
      <div>
        {/* Thumbnail Box */}
        <div className="w-full aspect-video overflow-hidden relative bg-zinc-900">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={course.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isGenerating ? 'opacity-40 grayscale-[50%]' : 'group-hover:scale-105'
              }`}
              onError={(e) => {
                const target = course?.video_url || course?.youtube_url || course?.videoUrl || '';
                const match = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
                if (match && match[1] && !e.target.src.includes('mqdefault')) {
                  e.target.src = `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
                } else {
                  e.target.src = 'https://placehold.co/640x360?text=Interactive+Course';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
              <Film className="w-10 h-10 mb-2 opacity-50 text-amber-500" />
              <span className="text-[11px] font-mono">Interactive Video Course</span>
            </div>
          )}

          {/* Top overlay badge */}
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            {isGenerating && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                <Sparkles className="w-3 h-3" />
                {genProgress}% Generating
              </span>
            )}
            {isFailed && (
              <span className="px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Failed
              </span>
            )}
            {!isGenerating && !isFailed && studyProgress === 100 && (
              <span className="px-2.5 py-1 rounded-full bg-green-500/90 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>

          {/* Hover Play Button Overlay (when completed) */}
          {!isGenerating && !isFailed && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg">
                <PlayCircle className="w-4 h-4" />
                {studyProgress > 0 ? 'Continue' : 'Start Course'}
              </span>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-500">
            {isGenerating ? (
              <span className="flex items-center gap-1 text-amber-400 font-semibold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                AI Agents Processing
              </span>
            ) : isFailed ? (
              <span className="text-red-400 font-semibold">Generation Unsuccessful</span>
            ) : (
              <>
                <span>{course.modules?.length || 0} Modules</span>
                <span>•</span>
                <span>{totalSections} Lessons</span>
              </>
            )}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {isFailed ? errorMsg : course.description || 'Interactive course curriculum synthesized with AI.'}
          </p>
        </div>
      </div>

      {/* Progress & Bottom Bar */}
      <div className="px-5 pb-5 pt-2 border-t border-zinc-900/60 mt-auto">
        {isGenerating ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 truncate max-w-[200px] text-[10px]" title={genStep}>
                {genStep}
              </span>
              <span className="font-bold text-amber-400">{genProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-amber-500/20 relative">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-500 rounded-full relative overflow-hidden"
                style={{ width: `${genProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] -skew-x-12" />
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-red-400/80 line-clamp-1">Ready to retry</span>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {retrying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>Try Again</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-zinc-500 font-medium">
                {completedSections} of {totalSections} lessons
              </span>
              <span className="font-bold text-amber-400">{studyProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${studyProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;