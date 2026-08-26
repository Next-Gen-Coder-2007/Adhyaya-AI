import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  PlayCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  AlertCircle,
  BookOpen,
  FileText,
  HelpCircle,
  Film,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Copy,
  Check,
  RotateCcw,
  Trophy,
  Award,
  Maximize2,
  Keyboard,
  X
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/Dashboard/Navbar';
import ChatPanel from './ChatPanel';
import CustomYouTubePlayer from './CustomYoutubePlayer';
import CertificateModal from './CertificateModal';
import { useCourseProgress } from '../../hooks/useCourseProgress';
import { useToast } from '../../context/ToastContext';

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return null;
  const totalSeconds = Math.floor(Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSecs}` : `${paddedMinutes}:${paddedSecs}`;
};

const renderTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (start && end && start !== end) return `${start} - ${end}`;
  if (start) return `Starts at ${start}`;
  return 'Full timeline';
};

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
      return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
  }
};

const getSectionTypeLabel = (type) => {
  switch (type) {
    case 'video':
      return 'Video Lecture';
    case 'quiz':
      return 'Assessment Quiz';
    case 'assignment':
      return 'Practical Lab';
    case 'summary':
      return 'Summary & Resources';
    default:
      return 'Lesson';
  }
};

const getYouTubeVideoId = (url, fallbackCourse) => {
  const target = url || fallbackCourse?.video_url || fallbackCourse?.youtube_url || fallbackCourse?.videoUrl || fallbackCourse?.modules?.[0]?.video_url;
  if (!target) return null;
  try {
    const match = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) return match[1];

    if (target.includes('youtube.com/watch')) {
      const urlObj = new URL(target.startsWith('http') ? target : `https://${target}`);
      return urlObj.searchParams.get('v') || null;
    } else if (target.includes('youtu.be/')) {
      return target.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || null;
    } else if (target.includes('youtube.com/embed/')) {
      return target.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0] || null;
    }
    return null;
  } catch {
    return null;
  }
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeSection, setActiveSection] = useState(null);

  // Active Workspace Tab for Content: 'content', 'notes'
  const [activeTab, setActiveTab] = useState('content');

  // Study Notes
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Video player references
  const [playerInstance, setPlayerInstance] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  // Copy indicator
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Certificate & Shortcuts Modals
  const [certData, setCertData] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [loadingCert, setLoadingCert] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

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

  const handleRetryCourse = async () => {
    try {
      setRetrying(true);
      await api.post(`/courses/${id}/retry`);
      await fetchCourse();
    } catch (err) {
      console.error('Failed to retry course:', err);
    } finally {
      setRetrying(false);
    }
  };

  const { progress: genProgress, step: genStep } = useCourseProgress(
    course?.status,
    course?.created_at || course?.createdAt
  );

  const fetchCourse = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data;
      setCourse(courseData);
      setNotes(courseData.notes || '');

      if (courseData?.modules?.length > 0) {
        setExpandedModules({ [courseData.modules[0].id]: true });
        if (courseData.modules[0].sections?.length > 0 && !activeSection) {
          const firstSection = courseData.modules[0].sections[0];
          setActiveSection({
            moduleId: courseData.modules[0].id,
            sectionIndex: 0,
            ...firstSection,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
      if (!silent) setError('Could not load course. Please check if the course exists.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    let interval;
    if (course?.status === 'generating') {
      interval = setInterval(() => {
        fetchCourse(true);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [course?.status]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === '?') {
        setIsShortcutsOpen((v) => !v);
      }
      if ((e.key === 'j' || e.key === 'J') && playerInstance) {
        playerInstance.seekTo(Math.max(0, currentVideoTime - 10), true);
      }
      if ((e.key === 'l' || e.key === 'L') && playerInstance) {
        playerInstance.seekTo(currentVideoTime + 10, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerInstance, currentVideoTime]);

  // Handle section change and reset quiz state
  const handleSelectSection = (module, sIdx, section) => {
    setActiveSection({
      moduleId: module.id,
      sectionIndex: sIdx,
      ...section,
    });
    setQuizAnswers(section.quiz_answers || {});
    setQuizSubmitted(!!section.quiz_score);
    setQuizScore(section.quiz_score || null);
    setActiveTab('content');

    // Seek player if it's a video section
    if (section.type === 'video' && section.start_time !== undefined && playerInstance) {
      playerInstance.seekTo(section.start_time, true);
    }
  };

  // Flattened all sections list for Next/Prev navigation
  const allSectionsList = course?.modules?.flatMap((m, mIdx) =>
    (m.sections || []).map((s, sIdx) => ({
      ...s,
      moduleId: m.id,
      moduleIndex: mIdx,
      sectionIndex: sIdx,
      moduleTitle: m.title,
    }))
  ) || [];

  const currentSectionIndex = allSectionsList.findIndex(
    (s) => s.id === activeSection?.id
  );

  const prevSection = currentSectionIndex > 0 ? allSectionsList[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex >= 0 && currentSectionIndex < allSectionsList.length - 1
    ? allSectionsList[currentSectionIndex + 1]
    : null;

  const goToPrevSection = () => {
    if (prevSection) {
      const mod = course.modules.find((m) => m.id === prevSection.moduleId);
      handleSelectSection(mod, prevSection.sectionIndex, prevSection);
    }
  };

  const goToNextSection = () => {
    if (nextSection) {
      const mod = course.modules.find((m) => m.id === nextSection.moduleId);
      handleSelectSection(mod, nextSection.sectionIndex, nextSection);
    }
  };

  // Progress Calculations
  const totalSections = allSectionsList.length;
  const completedSections = allSectionsList.filter((s) => s.completed).length;
  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  // Toggle Section Completion
  const toggleSectionCompletion = async (sectionId) => {
    try {
      const response = await api.patch(`/courses/sections/${sectionId}/toggle`);
      const updatedCompleted = response.data.completed;

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((module) => ({
          ...module,
          sections: module.sections.map((section) =>
            section.id === sectionId ? { ...section, completed: updatedCompleted } : section
          ),
        })),
      }));

      if (activeSection?.id === sectionId) {
        setActiveSection((prev) => ({ ...prev, completed: updatedCompleted }));
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  // Quiz submission
  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeSection?.content?.quiz) return;
    setSubmittingQuiz(true);

    let correctCount = 0;
    const questions = activeSection.content.quiz;
    questions.forEach((q, idx) => {
      const userAns = (quizAnswers[idx] || '').trim().toLowerCase();
      const correctAns = (q.correct_answer || '').trim().toLowerCase();
      if (userAns === correctAns) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      await api.post(`/courses/sections/${activeSection.id}/quiz-submit`, {
        answers: quizAnswers,
        score,
      });

      // Update local state
      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((module) => ({
          ...module,
          sections: module.sections.map((section) =>
            section.id === activeSection.id
              ? {
                  ...section,
                  quiz_score: score,
                  quiz_answers: quizAnswers,
                  completed: score >= 60 ? true : section.completed,
                }
              : section
          ),
        })),
      }));

      if (score >= 60) {
        setActiveSection((prev) => ({ ...prev, completed: true, quiz_score: score }));
      }
    } catch (err) {
      console.error('Failed to submit quiz score:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Save Notes
  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      await api.put(`/courses/${id}/notes`, { notes });
      setNotesSaved(true);
      toast.success('Study notes saved successfully!', 'Notes Saved', 5000);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error(err.response?.data?.detail || 'Failed to save notes. Please try again.', 'Save Error', 5000);
    } finally {
      setNotesSaving(false);
    }
  };

  // Insert current timestamp into notes
  const handleInsertTimestampNote = () => {
    const timeFormatted = formatTime(currentVideoTime) || '00:00';
    const timestampTag = `\n\n📌 **[${timeFormatted}]** - `;
    setNotes((prev) => prev + timestampTag);
    setActiveTab('notes');
  };

  const handleInsertAIAnswerToNotes = (text) => {
    setNotes((prev) => prev + `\n\n> 🤖 **AI Tutor Insight:**\n> ${text.replace(/\n/g, '\n> ')}\n`);
    setActiveTab('notes');
  };

  const seekVideo = (seconds) => {
    if (playerInstance && typeof playerInstance.seekTo === 'function') {
      playerInstance.seekTo(seconds, true);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const copySummaryText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Loading Screen
  if (loading && !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <Sparkles className="w-4 h-4 text-amber-500 absolute top-0 right-0 animate-ping" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Loading course curriculum and studio...</p>
        </div>
      </Navbar>
    );
  }

  // Error Screen
  if (error || !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Load Error</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">{error || 'Course not found'}</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            ← Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  // Generating Screen
  if (course.status === 'generating') {
    const steps = [
      { id: 1, label: 'Extract Video Captions & Timeline', min: 20 },
      { id: 2, label: 'Map 10-Hour Timeline & Module Boundaries', min: 35 },
      { id: 3, label: 'Synthesize Lessons, Quizzes & Labs', min: 88 },
      { id: 4, label: 'Index Semantic Vectors for AI Tutor', min: 95 },
    ];

    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto px-4 space-y-6">
          <div className="w-full relative p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-amber-500/30 shadow-2xl space-y-6">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">
                  LangGraph Agentic Pipeline
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Synthesizing Course Track
                </h2>
              </div>
            </div>

            {/* Glowing Percentage & Progress Bar */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="truncate max-w-[280px] sm:max-w-md text-left">{genStep}</span>
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight shrink-0 ml-2">
                  {genProgress}%
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-950 rounded-full overflow-hidden border border-amber-500/20 relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all duration-500 rounded-full relative overflow-hidden"
                  style={{ width: `${genProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-[shimmer_1.5s_infinite] -skew-x-12" />
                </div>
              </div>
            </div>

            {/* Step Milestones Checklist */}
            <div className="grid grid-cols-1 gap-2 text-left pt-1">
              {steps.map((s) => {
                const isDone = genProgress >= s.min;
                const isCurrent = genProgress < s.min && (s.id === 1 || genProgress >= steps[s.id - 2]?.min);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                      isDone
                        ? 'bg-amber-500/10 border-amber-500/30 text-slate-800 dark:text-zinc-200'
                        : isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-md font-semibold'
                        : 'bg-slate-50 dark:bg-zinc-900/30 border-slate-200 dark:border-zinc-900 text-slate-400 dark:text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-zinc-700 shrink-0" />
                      )}
                      <span>{s.label}</span>
                    </div>
                    {isDone && <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">Ready</span>}
                    {isCurrent && <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase animate-pulse">Running</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            ← Return to Courses
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
          <div className="w-full relative p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/40 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-lg shadow-red-500/10">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 block">
                Synthesis Unsuccessful
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Course Generation Failed</h2>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed text-left">
              <p className="font-semibold text-red-600 dark:text-red-300 mb-1">Reason:</p>
              <p className="text-slate-600 dark:text-zinc-400">{errorMsg}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetryCourse}
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
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white text-xs font-semibold rounded-2xl transition-all cursor-pointer shadow-sm"
              >
                Browse Other Courses
              </button>
            </div>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 py-2 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shrink-0 shadow-sm"
              title="Course Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-500 block">
                Study Room
              </span>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-2xl">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Progress Bar */}
            <div className="w-40 hidden sm:block">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                <span>Curriculum Progress</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Certificate Trigger when 100% complete */}
            {progress === 100 && (
              <button
                onClick={handleOpenCertificate}
                disabled={loadingCert}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all cursor-pointer"
                title="Claim Certificate of Completion"
              >
                {loadingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">Certificate</span>
              </button>
            )}

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
              title="Keyboard Hotkeys (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Export Notes / Syllabus */}
            <a
              href={`${api.defaults.baseURL || ''}/courses/${id}/export`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors shadow-sm"
              title="Download Course & Notes Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Notes</span>
            </a>
          </div>
        </div>

        {/* Studio Grid: Content Area (Left 8 cols) & Syllabus (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Content Tabs (Lesson Hub vs Live Notes) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'content'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {getSectionIcon(activeSection?.type)}
                  <span>{getSectionTypeLabel(activeSection?.type)}</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Study Notes & Scratchpad</span>
                  {notes && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>
              </div>

              {/* Complete Section Button */}
              {activeSection && (
                <button
                  onClick={() => toggleSectionCompletion(activeSection.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    activeSection.completed
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {activeSection.completed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* TAB 1: Main Content Node */}
            {activeTab === 'content' && (
              <>
                {/* VIDEO SECTION */}
                {activeSection?.type === 'video' && (
                  <div className="space-y-4">
                    {(() => {
                      const module = course.modules?.find((m) => m.id === activeSection.moduleId);
                      const videoUrl = module?.video_url || module?.videoUrl || course?.video_url || course?.youtube_url || course?.videoUrl;
                      const videoId = getYouTubeVideoId(videoUrl, course);

                      if (!videoId) {
                        return (
                          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 text-slate-500 dark:text-zinc-500 shadow-sm">
                            <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Video URL is not available for this lecture.</p>
                          </div>
                        );
                      }

                      return (
                        <CustomYouTubePlayer
                          videoId={videoId}
                          startTime={activeSection.start_time || 0}
                          endTime={activeSection.end_time || null}
                          onReady={(inst) => setPlayerInstance(inst)}
                          onTimeUpdate={(t) => setCurrentVideoTime(t)}
                        />
                      );
                    })()}

                    {/* Video Metadata & Live Timestamp Controls */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeSection.title}</h2>
                        <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                          Timeline: {renderTimeRange(activeSection.start_time, activeSection.end_time)}
                        </p>
                      </div>

                      <button
                        onClick={handleInsertTimestampNote}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer shrink-0 shadow-sm"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>+ Note at {formatTime(currentVideoTime) || '00:00'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* QUIZ SECTION */}
                {activeSection?.type === 'quiz' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 space-y-6 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-900 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                          Module Assessment
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeSection.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                          Test your understanding of the concepts covered in this module.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Quiz Questions */}
                    <div className="space-y-5">
                      {activeSection.content?.quiz?.map((q, qIdx) => {
                        const userAnswer = quizAnswers[qIdx];
                        const isAnswered = userAnswer !== undefined;
                        const isCorrect = isAnswered && (userAnswer || '').trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();

                        return (
                          <div
                            key={qIdx}
                            className={`p-5 rounded-xl border transition-all ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                                  : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-500/40'
                                : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                {qIdx + 1}. {q.question}
                              </p>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700">
                                {q.type}
                              </span>
                            </div>

                            {/* Options */}
                            {q.type === 'MCQ' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = userAnswer === opt;
                                  const isOptCorrect = (opt || '').trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();

                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => !quizSubmitted && handleAnswerSelect(qIdx, opt)}
                                      disabled={quizSubmitted}
                                      className={`p-3 rounded-xl text-xs text-left transition-all flex items-center justify-between border cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white font-medium'
                                          : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                                      } ${
                                        quizSubmitted && isOptCorrect
                                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                                          : ''
                                      } ${
                                        quizSubmitted && isSelected && !isOptCorrect
                                          ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300'
                                          : ''
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {quizSubmitted && isOptCorrect && (
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* True / False */}
                            {q.type === 'True/False' && (
                              <div className="flex gap-3 mt-3">
                                {['True', 'False'].map((opt) => {
                                  const isSelected = (userAnswer || '').toLowerCase() === opt.toLowerCase();
                                  const isOptCorrect = (q.correct_answer || '').toLowerCase() === opt.toLowerCase();

                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => !quizSubmitted && handleAnswerSelect(qIdx, opt)}
                                      disabled={quizSubmitted}
                                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white font-bold'
                                          : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                                      } ${
                                        quizSubmitted && isOptCorrect
                                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                                          : ''
                                      } ${
                                        quizSubmitted && isSelected && !isOptCorrect
                                          ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300'
                                          : ''
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Short Answer */}
                            {q.type === 'Short Answer' && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  value={userAnswer || ''}
                                  onChange={(e) => !quizSubmitted && handleAnswerSelect(qIdx, e.target.value)}
                                  disabled={quizSubmitted}
                                  placeholder="Type your answer here..."
                                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            )}

                            {/* Explanation Feedback */}
                            {quizSubmitted && (
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800/60 text-xs space-y-1">
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  ✓ Correct Answer: {q.correct_answer}
                                </p>
                                {q.explanation && (
                                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed italic">
                                    Explanation: {q.explanation}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz Controls & Score Card */}
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz || Object.keys(quizAnswers).length === 0}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {submittingQuiz ? 'Evaluating Quiz...' : 'Submit Assessment'}
                      </button>
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto">
                          <Trophy className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assessment Results</h3>
                          <p
                            className={`text-3xl font-black mt-1 ${
                              quizScore >= 70
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : quizScore >= 50
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {quizScore}%
                          </p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                            {quizScore >= 70
                              ? '🎉 Mastery unlocked! Section marked as completed.'
                              : 'Keep practicing to reinforce the core concepts.'}
                          </p>
                        </div>
                        <button
                          onClick={resetQuiz}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 border border-slate-200 dark:border-zinc-700 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake Quiz</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ASSIGNMENT SECTION */}
                {activeSection?.type === 'assignment' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 space-y-6 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-900 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                          Hands-on Project Lab
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeSection.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                          Apply what you learned through real-world implementation milestones.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {activeSection.content?.assignments?.map((assignment, aIdx) => (
                        <div key={aIdx} className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                                {assignment.difficulty || 'Intermediate'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                              {assignment.description}
                            </p>
                          </div>

                          {/* Task Milestones */}
                          {assignment.tasks?.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                                Mission Objectives
                              </h4>
                              <div className="space-y-1.5">
                                {assignment.tasks.map((task, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className="p-3 rounded-lg bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-800 dark:text-zinc-300 flex items-start gap-2.5 shadow-sm"
                                  >
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>{task}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evaluation Criteria */}
                          {assignment.evaluation_criteria?.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                                Self-Evaluation Rubric
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {assignment.evaluation_criteria.map((crit, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-400 flex items-center gap-2"
                                  >
                                    <Check className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                                    <span>{crit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUMMARY & RESOURCES SECTION */}
                {activeSection?.type === 'summary' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 space-y-6 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-900 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 block">
                          Module Summary & Assets
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeSection.title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copySummaryText(activeSection.content?.summary || '')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
                        >
                          {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                        </button>
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Synopsis */}
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                        Synopsis Overview
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-normal">
                        {activeSection.content?.summary || 'No summary overview provided.'}
                      </p>
                    </div>

                    {/* Key Takeaways */}
                    {activeSection.content?.key_takeaways?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                          Key Takeaways
                        </h4>
                        <div className="space-y-2">
                          {activeSection.content.key_takeaways.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5 shadow-sm"
                            >
                              <span className="text-amber-500 font-bold">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Resources */}
                    {activeSection.content?.resources?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                          Recommended References & Documentation
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeSection.content.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-500/40 text-xs flex items-center justify-between group transition-all shadow-sm"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-semibold text-slate-900 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-white truncate">
                                  {res.title}
                                </p>
                                {res.description && (
                                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate mt-0.5">
                                    {res.description}
                                  </p>
                                )}
                              </div>
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:text-zinc-500 dark:group-hover:text-purple-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: Study Notes & Scratchpad */}
            {activeTab === 'notes' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-900 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Study Notes</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Take markdown notes, bookmark timestamps, and capture insights from AI Tutor.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInsertTimestampNote}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Insert Timestamp</span>
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={notesSaving}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/15"
                    >
                      {notesSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{notesSaving ? 'Saving...' : notesSaved ? 'Saved!' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Start taking notes... (Markdown formatting supported: **bold**, - lists, ## headings)"
                  rows={14}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800/80">
              <button
                onClick={goToPrevSection}
                disabled={!prevSection}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              <button
                onClick={goToNextSection}
                disabled={!nextSection}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-500/20"
              >
                <span>Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar Syllabus Index (4 Cols) - Smooth Sticky & Scrolling with 2-Finger Scroll Support */}
          <div
            data-lenis-prevent
            className="lg:col-span-4 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 overflow-hidden shadow-xl sticky top-20 self-start max-h-[calc(100vh-6.5rem)] flex flex-col z-20 overscroll-contain"
          >
            <div className="p-4 border-b border-slate-200 dark:border-zinc-900 bg-slate-50/90 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-300">
                  Course Syllabus
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {completedSections} / {totalSections} lessons completed
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-slate-200 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-slate-300 dark:border-zinc-700">
                {course.modules?.length || 0} Modules
              </span>
            </div>

            {/* Modules Accordion */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-zinc-900 scrollbar-thin overscroll-contain touch-pan-y"
            >
              {course.modules?.map((module, mIdx) => {
                const isExpanded = !!expandedModules[module.id];
                const moduleSections = module.sections || [];

                return (
                  <div key={module.id || mIdx} className="bg-white dark:bg-zinc-950/40">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    >
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 block">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 dark:text-zinc-200 dark:group-hover:text-white line-clamp-2">
                          {module.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                          <span>{renderTimeRange(module.start_time, module.end_time)}</span>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1 text-slate-400 dark:text-zinc-500">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Sub Sections list */}
                    {isExpanded && (
                      <div className="bg-slate-50/60 dark:bg-zinc-900/20 border-t border-slate-200 dark:border-zinc-900/80 divide-y divide-slate-200/80 dark:divide-zinc-900/40 pb-1">
                        {moduleSections.map((section, sIdx) => {
                          const isActive = activeSection?.id === section.id;
                          return (
                            <div
                              key={section.id || sIdx}
                              onClick={() => handleSelectSection(module, sIdx, section)}
                              className={`p-3.5 flex items-start gap-3 text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500/15 border-l-4 border-amber-500 text-slate-900 dark:text-white font-medium pl-3'
                                  : 'hover:bg-slate-100 dark:hover:bg-zinc-900/50 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                              }`}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSectionCompletion(section.id);
                                }}
                                className="mt-0.5 shrink-0 text-slate-400 hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-400 transition-colors"
                              >
                                {section.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`line-clamp-2 ${
                                    isActive ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-700 dark:text-zinc-300'
                                  } ${section.completed ? 'line-through text-slate-400 dark:text-zinc-600' : ''}`}
                                >
                                  {section.title}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    {getSectionIcon(section.type)}
                                    <span className="uppercase font-semibold">{section.type}</span>
                                  </span>
                                  {section.start_time !== null && section.start_time !== undefined && (
                                    <span className="font-mono text-slate-500 dark:text-zinc-400">
                                      @{formatTime(section.start_time)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded AI Tutor Companion */}
      <ChatPanel
        courseId={id}
        courseStatus={course?.status}
        onTimestampClick={(seconds) => seekVideo(seconds)}
        onInsertToNotes={(text) => handleInsertAIAnswerToNotes(text)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certData={certData}
      />

      {/* Keyboard Shortcuts HUD */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Study Room Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'J / L', desc: 'Rewind / Fast Forward 10 seconds' },
                { key: '?', desc: 'Toggle keyboard shortcuts menu' },
                { key: 'Space', desc: 'Play / Pause synchronized video' },
                { key: 'Tab', desc: 'Switch between Content and Notes' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">{s.desc}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                    {s.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default CourseDetail;