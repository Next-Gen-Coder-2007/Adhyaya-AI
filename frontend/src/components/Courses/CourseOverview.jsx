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
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../Dashboard/Navbar';
import CertificateModal from './CertificateModal';
import { useCourseProgress } from '../../hooks/useCourseProgress';
import { getCourseThumbnail } from './CourseCard';

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

  // Certificate Modal State
  const [certData, setCertData] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [loadingCert, setLoadingCert] = useState(false);

  const [retrying, setRetrying] = useState(false);

  const { progress: genProgress, step: genStep } = useCourseProgress(
    course?.status,
    course?.created_at || course?.createdAt
  );

  const fetchCourseOverview = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data;
      setCourse(courseData);
      if (courseData.modules?.length > 0) {
        setExpandedModules({ [courseData.modules[0].id]: true });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load course overview:', err);
      if (!silent) setError('Could not retrieve course metrics. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseOverview();
  }, [id]);

  useEffect(() => {
    let interval;
    if (course?.status === 'generating') {
      interval = setInterval(() => {
        fetchCourseOverview(true);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [course?.status]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      await api.post(`/courses/${id}/retry`);
      await fetchCourseOverview();
    } catch (err) {
      console.error('Failed to retry course:', err);
    } finally {
      setRetrying(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleOpenCertificate = async () => {
    try {
      setLoadingCert(true);
      const res = await api.get(`/courses/${id}/certificate`);
      setCertData(res.data);
      setIsCertModalOpen(true);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    } finally {
      setLoadingCert(false);
    }
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs text-zinc-500">Loading course overview...</p>
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

  // Generating Screen
  if (course.status === 'generating') {

    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto px-4 space-y-6">
          <div className="w-full relative p-8 rounded-3xl bg-zinc-950/90 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">
                LangGraph Agentic Pipeline
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {course.title || 'Synthesizing Course'}
              </h2>
            </div>

            <div className="space-y-3 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="truncate max-w-[260px] text-left">{genStep}</span>
                </div>
                <span className="text-xl font-extrabold text-white font-mono tracking-tight shrink-0 ml-2">
                  {genProgress}%
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-amber-500/20 relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all duration-500 rounded-full relative overflow-hidden"
                  style={{ width: `${genProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-[shimmer_1.5s_infinite] -skew-x-12" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl hover:text-white transition-all cursor-pointer"
          >
            ← Return to All Courses
          </button>
        </div>
      </Navbar>
    );
  }

  // Failed Screen
  if (course.status === 'failed') {
    const errorMsg = course.error_message || course.errorMessage || 'Could not extract video content or transcripts. Ensure video has captions or try another link.';

    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto px-4 space-y-6">
          <div className="w-full relative p-8 rounded-3xl bg-zinc-950/90 border border-red-900/40 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 block">
                Synthesis Unsuccessful
              </span>
              <h2 className="text-2xl font-extrabold text-white">Course Generation Failed</h2>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-xs text-zinc-300 leading-relaxed text-left">
              <p className="font-semibold text-red-300 mb-1">Reason:</p>
              <p className="text-zinc-400">{errorMsg}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Restarting Pipeline...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again / Retry Generation</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-5 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-2xl hover:text-white transition-all cursor-pointer"
              >
                Return to Courses
              </button>
            </div>
          </div>
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
  const isCompleted = progressPercent === 100;

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
            {isCompleted && (
              <button
                onClick={handleOpenCertificate}
                disabled={loadingCert}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity cursor-pointer"
              >
                {loadingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                <span>View Certificate</span>
              </button>
            )}

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
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Course
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight leading-snug">
                {course.title}
              </h1>

              <p className="text-sm text-[var(--text-secondary,#a1a1aa)] leading-relaxed font-normal">
                {course.description || 'Structured educational path curated from video sources.'}
              </p>

              {/* Course Meta Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))]">
                  <span className="text-[10px] text-[var(--text-muted,#71717a)] uppercase tracking-wider block">Modules</span>
                  <span className="text-base font-bold text-[var(--text-primary,#ffffff)] mt-0.5 block">{course.modules?.length || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))]">
                  <span className="text-[10px] text-[var(--text-muted,#71717a)] uppercase tracking-wider block">Lectures</span>
                  <span className="text-base font-bold text-[var(--text-primary,#ffffff)] mt-0.5 block">{videoCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))]">
                  <span className="text-[10px] text-[var(--text-muted,#71717a)] uppercase tracking-wider block">Quizzes</span>
                  <span className="text-base font-bold text-[var(--text-primary,#ffffff)] mt-0.5 block">{quizCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))]">
                  <span className="text-[10px] text-[var(--text-muted,#71717a)] uppercase tracking-wider block">Completed</span>
                  <span className="text-base font-bold text-amber-500 mt-0.5 block">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Thumbnail and Start Button */}
            <div className="w-full lg:w-72 space-y-4 shrink-0">
              {(() => {
                const thumb = getCourseThumbnail(course);
                if (!thumb) return null;
                return (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-[var(--border)] relative group shadow-xl">
                    <img
                      src={thumb}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = course?.video_url || course?.youtube_url || course?.videoUrl || '';
                        const match = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
                        if (match && match[1] && !e.target.src.includes('mqdefault')) {
                          e.target.src = `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
                        } else {
                          e.target.src = 'https://placehold.co/600x400?text=Course+Preview';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-amber-400 fill-current" />
                    </div>
                  </div>
                );
              })()}

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
              <h3 className="text-base font-bold text-[var(--text-primary,#ffffff)]">Course Syllabus</h3>
              <p className="text-xs text-[var(--text-muted,#71717a)]">Explore modules, learning nodes, and assignments</p>
            </div>
            <span className="text-xs font-semibold text-[var(--text-secondary,#a1a1aa)]">
              {completedCount} of {allSections.length} items completed
            </span>
          </div>

          <div className="space-y-3">
            {course.modules?.map((module, idx) => {
              const isExpanded = !!expandedModules[module.id];
              const modSections = module.sections || [];
              const modCompleted = modSections.filter((s) => s.completed).length;

              return (
                <div
                  key={module.id}
                  className="rounded-2xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary,#ffffff)]">{module.title}</h4>
                        <p className="text-[11px] text-[var(--text-muted,#71717a)]">
                          {modCompleted} of {modSections.length} completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--border,rgba(255,255,255,0.08))] p-3 bg-[var(--bg-tertiary,#1c1c21)] space-y-2">
                      {modSections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => navigate(`/courses/${id}/learn`)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getSectionIcon(section.type)}
                            <span className="text-[var(--text-secondary,#a1a1aa)] hover:text-[var(--text-primary,#ffffff)] truncate font-medium">
                              {section.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--text-muted,#71717a)] uppercase tracking-wider font-mono">
                              {getSectionTypeLabel(section.type)}
                            </span>
                            {section.completed && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Delete Course</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to delete "{course.title}"? This action will permanently remove all modules, quiz scores, and vector embeddings.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          certData={certData}
        />
      </div>
    </Navbar>
  );
};

export default CourseOverview;