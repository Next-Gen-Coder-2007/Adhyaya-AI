import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="
        group flex items-center gap-4 p-3.5 rounded-2xl
        bg-zinc-950 border border-zinc-900
        hover:border-amber-500/50 hover:bg-zinc-900/60
        transition-all duration-300 cursor-pointer shadow-sm
      "
    >
      <div className="w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://placehold.co/320x180?text=No+Image';
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-zinc-100 truncate group-hover:text-amber-500 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
          {course.description}
        </p>

        {course.status === "completed" && totalSections > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500">
                {completedSections} / {totalSections} completed
              </span>
              <span className="font-semibold text-amber-500">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
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