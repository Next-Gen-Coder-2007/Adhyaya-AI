import { PlayCircle } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
  const totalSections =
    course.modules?.reduce(
      (acc, module) =>
        acc + (module.sections?.length || 0),
      0
    ) || 0;

  const completedSections =
    course.modules?.reduce(
      (acc, module) =>
        acc +
        (
          module.sections?.filter(
            (section) => section.completed
          ).length || 0
        ),
      0
    ) || 0;

  const progress =
    totalSections > 0
      ? Math.round(
          (completedSections / totalSections) * 100
        )
      : 0;

  return (
    <div
      onClick={onClick}
      className="
        group rounded-2xl bg-[#0a0a0a]
        border border-[#1e1e1e]
        overflow-hidden
        hover:border-amber-600/60
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_16px_48px_rgba(217,119,6,0.15)]
        cursor-pointer
      "
    >

      {/* =========================
          Thumbnail
      ========================= */}

      {course.image_url && (
        <div className="w-full aspect-video overflow-hidden relative">

          <img
            src={course.image_url}
            alt={course.title}
            className="
              w-full h-full object-cover
              group-hover:scale-105
              transition-transform duration-300
            "
            onError={(e) => {
              e.target.src =
                'https://placehold.co/640x360?text=Thumbnail+Not+Available';
            }}
          />

          {/* Overlay */}
          <div className="
            absolute inset-0
            bg-gradient-to-t
            from-black/70 to-transparent
            flex items-end p-5
          ">

            <button
              onClick={(e) => e.stopPropagation()}
              className="
                opacity-0 group-hover:opacity-100
                flex items-center gap-2
                bg-gradient-to-r
                from-amber-600 to-yellow-500
                text-black font-medium
                py-2 px-4 rounded-lg
                shadow-[0_0_15px_rgba(217,119,6,0.5)]
                hover:shadow-[0_0_25px_rgba(217,119,6,0.8)]
                transition-all duration-300
                cursor-pointer
              "
            >
              <PlayCircle className="w-4 h-4" />
              Continue
            </button>

          </div>
        </div>
      )}

      {/* =========================
          Content
      ========================= */}

      <div className="p-5">

        {/* Title */}
        <h3
          className="
            text-[17px]
            font-semibold
            text-zinc-100
            leading-snug
            mb-2
            group-hover:text-amber-500
            transition-colors duration-200
          "
        >
          {course.title}
        </h3>

        {/* Description */}
        <p className="
          text-sm text-zinc-600
          leading-relaxed
          line-clamp-2
        ">
          {course.description}
        </p>

        {/* =========================
            Progress Section
        ========================= */}

        {course.status === "completed" && totalSections > 0 && (
          <div className="mt-5 space-y-2">

            {/* Top Row */}
            <div className="
              flex items-center justify-between
              text-[11px]
            ">

              <span className="text-zinc-500">
                {completedSections} / {totalSections} completed
              </span>

              <span className="font-semibold text-amber-500">
                {progress}%
              </span>

            </div>

            {/* Progress Bar */}
            <div className="
              w-full h-1.5
              bg-zinc-800
              rounded-full
              overflow-hidden
            ">
              <div
                className="
                  h-full
                  bg-gradient-to-r
                  from-amber-500 to-yellow-400
                  transition-all duration-500
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>
        )}

        {/* =========================
            No Thumbnail Button
        ========================= */}

        {!course.image_url && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="
              opacity-0 group-hover:opacity-100
              w-full flex items-center justify-center gap-2
              bg-gradient-to-r
              from-amber-600 to-yellow-500
              text-black font-medium
              py-2.5 px-4 rounded-lg
              shadow-[0_0_15px_rgba(217,119,6,0.5)]
              hover:shadow-[0_0_25px_rgba(217,119,6,0.8)]
              transition-all duration-300
              cursor-pointer
              mt-4
            "
          >
            <PlayCircle className="w-4 h-4" />
            Continue
          </button>
        )}

        {/* =========================
            Status
        ========================= */}

        {course.status === "generating" && (
          <div className="
            mt-4
            text-xs
            text-amber-400
            font-medium
          ">
            Generating modules...
          </div>
        )}

        {course.status === "completed" && (
          <div className="
            mt-4
            flex items-center justify-between
          ">

            <div className="
              text-xs
              text-green-400
              font-medium
            ">
              Ready
            </div>

            {progress === 100 && (
              <div className="
                text-[10px]
                px-2 py-1
                rounded-full
                bg-green-500/10
                text-green-400
                border border-green-500/20
              ">
                Completed
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CourseCard;