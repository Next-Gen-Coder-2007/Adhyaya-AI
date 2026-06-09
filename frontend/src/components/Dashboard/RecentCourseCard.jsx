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
        group flex items-center gap-4 p-3 rounded-xl
        bg-[#0a0a0a] border border-[#1e1e1e]
        hover:border-amber-600/60 hover:bg-[#121212]
        transition-all duration-300 cursor-pointer
      "
    >
      <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
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
        <h3 className="text-sm font-medium text-zinc-200 truncate group-hover:text-amber-500 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-1 mt-1">
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

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <PlayCircle className="w-5 h-5 text-amber-500" />
      </div>
    </div>
  );
};

export default RecentCourseCard;