import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, PlayCircle, ArrowLeft, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/Dashboard/Navbar';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Failed to load course. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    const interval = setInterval(() => {
      if (course?.status === 'generating') {
        fetchCourse();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, course?.status]);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  };

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  if (loading && !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" aria-label="Loading course" />
          <p className="mt-4 text-zinc-400">Loading course details...</p>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-200">Error Loading Course</h2>
          <p className="mt-2 text-zinc-400">{error}</p>
          <button
            onClick={fetchCourse}
            className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </Navbar>
    );
  }

  if (!course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PlayCircle className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-200">Course Not Found</h2>
          <p className="mt-2 text-zinc-500">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  if (course.status === 'generating') {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="relative">
            <Sparkles className="w-16 h-16 text-amber-500 animate-pulse" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-spin text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-6">Generating Course Modules</h2>
          <p className="mt-2 text-zinc-400">
            Our AI is analyzing your {course.is_playlist ? 'playlist' : 'video'} and creating a structured curriculum.
          </p>
          <div className="mt-6 w-full">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '75%' }} />
            </div>
            <p className="text-sm text-zinc-500 mt-2">This may take a few minutes...</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
          >
            ← Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  if (course.modules.length === 0) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-200">No Modules Available</h2>
          <p className="mt-2 text-zinc-400">
            {course.status === 'failed'
              ? 'Failed to generate modules. Please try again.'
              : "This course doesn't have any modules yet."}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          aria-label="Go back to courses"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Courses</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-video">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                    {course.is_playlist ? 'Playlist' : 'Single Video'}
                  </span>
                  <span className="px-2 py-1 bg-zinc-800/50 text-zinc-300 text-xs font-medium rounded-full">
                    {course.modules.length} Modules
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {course.title || 'Untitled Course'}
              </h1>
              <p className="text-zinc-400">
                {course.description || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Right Column: Modules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Course Modules</h2>
              <span className="text-sm text-zinc-500">
                {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
              </span>
            </div>
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700"
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                    aria-expanded={expandedModule === module.id}
                    aria-controls={`module-content-${module.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                        {module.start_time && module.end_time && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(module.start_time)} - {formatTime(module.end_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.video_url && (
                        <a
                          href={module.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          aria-label={`Watch ${module.title}`}
                        >
                          <PlayCircle className="w-5 h-5" />
                        </a>
                      )}
                      <svg
                        className={`w-5 h-5 text-zinc-500 transition-transform ${expandedModule === module.id ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    id={`module-content-${module.id}`}
                    className={`px-4 pb-4 overflow-hidden transition-all duration-300 ${expandedModule === module.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-zinc-400 text-sm">
                        {module.start_time && module.end_time
                          ? `This module covers content from ${formatTime(module.start_time)} to ${formatTime(module.end_time)}.`
                          : 'Click the play button to watch this module.'}
                      </p>
                      {module.video_url && (
                        <div className="mt-4">
                          <a
                            href={module.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-sm font-medium rounded-lg transition-colors"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Watch Full Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default CourseDetail;