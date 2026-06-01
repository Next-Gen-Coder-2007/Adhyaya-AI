import { BookOpen, Clock, Flame, PlayCircle } from 'lucide-react';

const CourseCard = ({ course, onClick }) => (
  <div
    onClick={onClick}
    className="group rounded-2xl bg-zinc-950 border border-zinc-900 p-5 hover:border-amber-500/30 transition-all duration-200 cursor-pointer"
  >
    {course.thumbnail_url && (
      <div className="mb-4 overflow-hidden rounded-lg">
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-40 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400?text=Thumbnail+Not+Available';
          }}
        />
      </div>
    )}
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
        <BookOpen className="w-6 h-6 text-amber-500" />
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-400">
        {course.category || 'General'}
      </span>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
    <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{course.description}</p>
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {course.duration || '0h'}
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> {course.difficulty || 'Beginner'}
        </span>
      </div>
      <PlayCircle className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
    </div>
  </div>
);

export default CourseCard