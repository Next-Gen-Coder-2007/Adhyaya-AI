import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  FileText,
  HelpCircle,
  Film,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../Dashboard/Navbar';

const getSectionIcon = (type) => {
  const icons = {
    video: <Film className="w-4 h-4 text-zinc-400" />,
    quiz: <HelpCircle className="w-4 h-4 text-zinc-400" />,
    assignment: <FileText className="w-4 h-4 text-zinc-400" />,
    summary: <BookOpen className="w-4 h-4 text-zinc-400" />,
    default: <CheckCircle className="w-4 h-4 text-zinc-500" />
  };
  return icons[type] || icons.default;
};

const getSectionTypeLabel = (type) => {
  const labels = {
    video: 'Video Lecture',
    quiz: 'Practice Quiz',
    assignment: 'Hands-on Assignment',
    summary: 'Summary & Resources',
    default: 'Content Node'
  };
  return labels[type] || labels.default;
};

const CourseOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseOverview = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        const courseData = response.data;

        const isCourseReady = courseData.status === "completed" && courseData.modules?.length > 0;

        if (isCourseReady) {
          setCourse(courseData);
          setError(null);
          setLoading(false);
        } else {
          setTimeout(fetchCourseOverview, 2000);
        }
      } catch (err) {
        console.error('Failed to load course overview:', err);
        setError('Could not retrieve course metrics. Please try again.');
        setLoading(false);
      }
    };

    fetchCourseOverview();
  }, [id]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (loading) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-4 text-zinc-500 text-xs tracking-wide">
            {course?.status === "generating"
              ? "Generating course content..."
              : "Assembling curriculum framework..."}
          </p>
        </div>
      </Navbar>
    );
  }

  if (error || !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-zinc-200">Failed to Load Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-6 px-4 py-2 bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors hover:bg-zinc-700"
          >
            Back to Dashboard
          </button>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Courses</span>
        </button>

        <div className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              {course.description || "No description provided for this roadmap."}
            </p>
          </div>

          <button
            onClick={() => navigate(`/courses/${id}/learn`)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-all shadow-lg shadow-amber-500/5 active:scale-98 flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Learning
          </button>
        </div>

        {/* Syllabus / Curriculum Stack */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Course Syllabus</h3>
            <span className="text-xs font-mono text-zinc-500">
              {course.modules?.length || 0} Modules
            </span>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800 overflow-hidden">
            {course.modules?.map((module, index) => {
              const isExpanded = !!expandedModules[module.id];
              return (
                <div key={module.id || index} className="bg-zinc-900/10">

                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-zinc-800/20 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block">
                        Module {index + 1}
                      </span>
                      <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-zinc-100 transition-colors">
                        {module.title}
                      </h4>
                    </div>
                    <div className="text-zinc-500 group-hover:text-zinc-400 p-1 self-center transition-colors flex-shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-zinc-950/40 border-t border-zinc-800/50 px-5 pb-3 pt-1 divide-y divide-zinc-900/60">
                      {module.sections && module.sections.length > 0 ? (
                        module.sections.map((section, sIdx) => (
                          <div key={sIdx} className="py-3 flex items-center justify-between text-xs gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex-shrink-0 text-zinc-500">
                                {getSectionIcon(section.type)}
                              </div>
                              <span className="font-medium text-zinc-300 truncate">
                                {section.title || `Untitled Section`}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 border border-zinc-800/80 px-2 py-0.5 bg-zinc-900/40 rounded font-medium flex-shrink-0 uppercase tracking-wide">
                              {getSectionTypeLabel(section.type)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-600 text-xs py-3 italic pl-1">No scheduled sections in this module layout.</p>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Navbar>
  );
};

export default CourseOverview;