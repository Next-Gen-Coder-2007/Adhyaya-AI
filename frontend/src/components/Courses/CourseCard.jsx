import { PlayCircle } from 'lucide-react';

const CourseCard = ({ course, onClick }) => (
  <div
    onClick={onClick}
    className="group rounded-2xl bg-[#0a0a0a] border border-[#1e1e1e] overflow-hidden
              hover:border-amber-600/60 transition-all duration-300
              hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(217,119,6,0.15)]"
  >
    {course.image_url && (
      <div className="w-full aspect-video overflow-hidden relative">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://placehold.co/640x360?text=Thumbnail+Not+Available';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-medium py-2 px-4 rounded-lg
                      shadow-[0_0_15px_rgba(217,119,6,0.5)] hover:shadow-[0_0_25px_rgba(217,119,6,0.8)]
                      transition-all duration-300 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Continue
          </button>
        </div>
      </div>
    )}

    <div className="p-5">
      <h3 className="text-[17px] font-semibold text-zinc-100 leading-snug mb-2 group-hover:text-amber-500 transition-colors duration-200">
        {course.title}
      </h3>

      <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
        {course.description}
      </p>

      {!course.image_url && (
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-medium py-2.5 px-4 rounded-lg
                    shadow-[0_0_15px_rgba(217,119,6,0.5)] hover:shadow-[0_0_25px_rgba(217,119,6,0.8)]
                    transition-all duration-300 cursor-pointer mt-4"
        >
          <PlayCircle className="w-4 h-4" />
          Continue
        </button>
      )}

      {
        course.status === "generating" && (
          <div className="mt-2 text-xs text-amber-400">
            Generating modules...
          </div>
        )
      }

      {
        course.status === "completed" && (
          <div className="mt-2 text-xs text-green-400">
            Ready
          </div>
        )
      }
    </div>
  </div>
);

export default CourseCard;