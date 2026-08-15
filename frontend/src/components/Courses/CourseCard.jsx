import { PlayCircle, Clock, BookOpen, CheckCircle, Sparkles, Film } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
  const allSections = course.modules?.flatMap((m) => m.sections || []) || [];
  const totalSections = allSections.length;
  const completedSections = allSections.filter((s) => s.completed).length;
  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const isGenerating = course.status === 'generating';
  const isFailed = course.status === 'failed';

  return (
    <div
      onClick={onClick}
      className="group rounded-3xl bg-zinc-950/90 border border-zinc-900 overflow-hidden hover:border-amber-500/40 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Box */}
        <div className="w-full aspect-video overflow-hidden relative bg-zinc-900">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://placehold.co/640x360?text=Course+Thumbnail';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900">
              <Film className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-[11px] font-mono">Video Lecture Course</span>
            </div>
          )}

          {/* Top overlay badge */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {isGenerating && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                <Sparkles className="w-3 h-3" />
                Generating
              </span>
            )}
            {isFailed && (
              <span className="px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                Failed
              </span>
            )}
            {progress === 100 && (
              <span className="px-2.5 py-1 rounded-full bg-green-500/90 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg">
              <PlayCircle className="w-4 h-4" />
              {progress > 0 ? 'Continue' : 'Start Course'}
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-500">
            <span>{course.modules?.length || 0} Modules</span>
            <span>•</span>
            <span>{totalSections} Lessons</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {course.description || 'Interactive course curriculum synthesized with AI.'}
          </p>
        </div>
      </div>

      {/* Progress & Bottom Bar */}
      <div className="px-5 pb-5 pt-2 border-t border-zinc-900/60 mt-auto">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-zinc-500 font-medium">
            {completedSections} of {totalSections} lessons
          </span>
          <span className="font-bold text-amber-400">{progress}%</span>
        </div>

        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;