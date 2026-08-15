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
  CheckCircle,
  Trash2,
  Download,
  Award,
  Sparkles
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../Dashboard/Navbar';

const getSectionIcon = (type) => {
  switch (type) {
    case 'video':
      return <Film className="w-4 h-4 text-amber-500" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4 text-emerald-400" />;
    case 'assignment':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'summary':
      return <BookOpen className="w-4 h-4 text-purple-400" />;
    default:
      return <CheckCircle className="w-4 h-4 text-zinc-400" />;
  }
};

const getSectionTypeLabel = (type) => {
  switch (type) {
    case 'video':
      return 'Video Lecture';
    case 'quiz':
      return 'Practice Quiz';
    case 'assignment':
      return 'Hands-on Lab';
    case 'summary':
      return 'Summary & Resources';
    default:
      return 'Content Node';
  }
};

const CourseOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCourseOverview = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        const courseData = response.data;
        setCourse(courseData);
        if (courseData.modules?.length > 0) {
          setExpandedModules({ [courseData.modules[0].id]: true });
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load course overview:', err);
        setError('Could not retrieve course metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseOverview();
  }, [id]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleDeleteCourse = async () => {
    setDeleting(true);
    try {
      await api.delete(`/courses/${id}`);
      navigate('/courses');
    } catch (err) {
      console.error('Failed to delete course:', err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-zinc-400 text-xs tracking-wide">Assembling curriculum overview...</p>
        </div>
      </Navbar>
    );
  }

  if (error || !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Course Not Found</h2>
          <p className="text-sm text-zinc-400">{error || 'Could not find this course.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            ← Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  const allSections = course.modules?.flatMap((m) => m.sections || []) || [];
  const videoCount = allSections.filter((s) => s.type === 'video').length;
  const quizCount = allSections.filter((s) => s.type === 'quiz').length;
  const assignmentCount = allSections.filter((s) => s.type === 'assignment').length;
  const completedCount = allSections.filter((s) => s.completed).length;
  const progressPercent = allSections.length > 0 ? Math.round((completedCount / allSections.length) * 100) : 0;

  return (
    <Navbar>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Navigation back and Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All Courses</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`${api.defaults.baseURL || ''}/courses/${id}/export`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown</span>
            </a>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                AI Generated Course
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {course.title}
              </h1>

              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                {course.description || 'Structured educational path curated from video sources.'}
              </p>

              {/* Course Meta Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Modules</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{course.modules?.length || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Lectures</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{videoCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Quizzes</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{quizCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Completed</span>
                  <span className="text-base font-bold text-amber-400 mt-0.5 block">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Thumbnail and Start Button */}
            <div className="w-full lg:w-72 space-y-4 shrink-0">
              {course.image_url && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800 relative group shadow-xl">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400?text=Course+Preview';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-amber-400 fill-current" />
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/courses/${id}/learn`)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{progressPercent > 0 ? 'Continue Learning' : 'Start Course Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Course Syllabus</h3>
              <p className="text-xs text-zinc-500">Explore modules, learning nodes, and assignments</p>
            </div>
            <span className="text-xs font-mono text-zinc-400 font-semibold">
              {course.modules?.length || 0} Modules · {allSections.length} Total Lessons
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl divide-y divide-zinc-900 overflow-hidden shadow-xl">
            {course.modules?.map((module, mIdx) => {
              const isExpanded = !!expandedModules[module.id];
              const moduleSections = module.sections || [];

              return (
                <div key={module.id || mIdx} className="bg-zinc-950/40">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                        Module {mIdx + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">
                        {module.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {moduleSections.length} sections included
                      </p>
                    </div>

                    <div className="text-zinc-500 group-hover:text-zinc-300 p-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-zinc-900/30 border-t border-zinc-900 px-6 py-2 divide-y divide-zinc-900/60">
                      {moduleSections.map((section, sIdx) => (
                        <div
                          key={sIdx}
                          className="py-3 flex items-center justify-between text-xs text-zinc-300 gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {getSectionIcon(section.type)}
                            <span className="font-medium truncate">{section.title}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {section.completed && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-bold">
                                Done
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase font-medium">
                              {getSectionTypeLabel(section.type)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Course</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Are you sure you want to delete <strong className="text-zinc-200">{course.title}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default CourseOverview;