import { PlayCircle } from 'lucide-react';

const RecentCourseCard = ({ course }) => {
  return (
    <div
      className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10
                 border border-transparent hover:border-amber-500/20
                 transition-all duration-300 cursor-pointer"
    >
      <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://placehold.co/320x180?text=No+Image';
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
      </div>

      <div
        className="opacity-0 group-hover:opacity-100
                   transition-opacity duration-300"
      >
        <PlayCircle className="w-5 h-5 text-amber-500" />
      </div>
    </div>
  );
};

export default RecentCourseCard;