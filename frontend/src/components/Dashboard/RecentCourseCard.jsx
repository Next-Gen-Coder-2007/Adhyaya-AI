import { PlayCircle, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCourseThumbnail } from '../Courses/CourseCard';

const RecentCourseCard = ({ course }) => {
  const navigate = useNavigate();

  const totalSections =
    course.modules?.reduce(
      (acc, module) => acc + (module.sections?.length || 0),
      0
    ) || 0;

  const completedSections =
    course.modules?.reduce(
      (acc, module) =>
        acc +
        (module.sections?.filter((section) => section.completed).length || 0),
      0
    ) || 0;

  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const thumbnail = getCourseThumbnail(course);

  const handleClick = () => {
    navigate(`/courses/${course.id || course._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="
        group flex items-center gap-4 p-3.5 rounded-2xl
        bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900
        hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-zinc-900/60
        transition-all duration-300 cursor-pointer shadow-sm
      "
    >
      <div className="w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 relative">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = course?.video_url || course?.youtube_url || course?.videoUrl || '';
              const match = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
              if (match && match[1] && !e.target.src.includes('mqdefault')) {
                e.target.src = `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-500">
            <Film className="w-5 h-5 opacity-70" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
          {course.description}
        </p>

        {totalSections > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 dark:text-zinc-500 font-medium">
                {completedSections} / {totalSections} completed
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-500">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
        <PlayCircle className="w-5 h-5 text-amber-500" />
      </div>
    </div>
  );
};

export default RecentCourseCard;