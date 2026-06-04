import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  PlayCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Sparkles,
  AlertCircle,
  BookOpen,
  FileText,
  HelpCircle,
  Film,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import api from '../../api/axios';
import Navbar from '../../components/Dashboard/Navbar';

// Robust time formatter that correctly handles 0
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return null;
  
  const totalSeconds = Math.floor(Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSecs}`;
  }
  return `${paddedMinutes}:${paddedSecs}`;
};

// Render format helper for the timeline ranges
const renderTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  if (start !== null && end !== null && start !== end) {
    return `${start} - ${end}`;
  } else if (start !== null) {
    return `Starts at ${start}`;
  }
  return 'Timeline N/A';
};

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
    assignment: 'Assignment',
    summary: 'Summary & Resources',
    default: 'Content Node'
  };
  return labels[type] || labels.default;
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
      
      if (response.data?.modules?.length > 0) {
        setExpandedModules({ [response.data.modules[0].id]: true });
        if (response.data.modules[0].sections?.length > 0) {
          setActiveSection({
            moduleId: response.data.modules[0].id,
            sectionIndex: 0,
            ...response.data.modules[0].sections[0]
          });
        }
      }
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
  }, [id]);

  useEffect(() => {
    let interval;
    if (course?.status === 'generating') {
      interval = setInterval(() => {
        fetchCourse();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [course?.status]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (loading && !course) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-4 text-zinc-500 text-xs tracking-wide">Loading workspace setup...</p>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-zinc-200">Error Loading Course</h2>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <button onClick={fetchCourse} className="mt-6 px-4 py-2 bg-zinc-800 text-white text-xs font-medium rounded-lg hover:bg-zinc-700">
            Retry
          </button>
        </div>
      </Navbar>
    );
  }

  if (course?.status === 'generating') {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 animate-spin text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mt-6">Generating Course Structure</h2>
          <p className="mt-2 text-sm text-zinc-400">Processing media timelines into structural nodes...</p>
          <button onClick={() => navigate('/courses')} className="mt-6 px-4 py-2 bg-zinc-800 text-white text-xs font-medium rounded-lg">
            ← Back to Courses
          </button>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <button onClick={() => navigate(`/courses/${id}`)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>Course Overview</span>
          </button>
          <h1 className="text-base font-bold text-zinc-300 truncate max-w-xl font-mono">{course.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {activeSection?.type === 'video' && (
              <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 aspect-video relative flex flex-col items-center justify-center p-6 shadow-xl">
                <Film className="w-12 h-12 text-zinc-800 mb-4 animate-pulse" />
                <p className="text-zinc-300 font-semibold text-sm mb-1">{activeSection.title}</p>
                <p className="text-[11px] font-mono text-zinc-500 mb-6">
                  Segment Duration: {renderTimeRange(activeSection.start_time, activeSection.end_time)}
                </p>
                {course.modules.find(m => m.id === activeSection.moduleId)?.video_url && (
                  <a
                    href={course.modules.find(m => m.id === activeSection.moduleId).video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Launch Video Resource
                  </a>
                )}
              </div>
            )}

            {activeSection && activeSection.type !== 'video' && (
              <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-6 min-h-[450px] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                        {getSectionTypeLabel(activeSection.type)}
                      </span>
                      <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{activeSection.title}</h2>
                    </div>
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
                      {getSectionIcon(activeSection.type)}
                    </div>
                  </div>

                  {activeSection.type === 'quiz' && (
                    <div className="space-y-4">
                      {activeSection.content?.quiz?.map((question, qIndex) => (
                        <div key={qIndex} className="bg-zinc-950/40 border border-zinc-800/60 p-5 rounded-xl space-y-4">
                          <p className="font-semibold text-zinc-200 text-sm">{qIndex + 1}. {question.question}</p>
                          {question.type === 'MCQ' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                              {question.options?.map((option, oIndex) => (
                                <div key={oIndex} className="bg-zinc-900/30 border border-zinc-800/60 p-3 rounded-lg text-xs text-zinc-400 flex items-center gap-2.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 pt-3 border-t border-zinc-900/80 text-xs space-y-1">
                            <span className="text-amber-500 font-bold block">✔ Solution Option: {question.correct_answer}</span>
                            <span className="text-zinc-500 block leading-relaxed font-normal italic">Context: {question.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection.type === 'assignment' && (
                    <div className="space-y-4">
                      {activeSection.content?.assignments?.map((assignment, aIndex) => (
                        <div key={aIndex} className="space-y-4">
                          <div className="bg-zinc-950/40 p-4 border border-zinc-800/60 rounded-xl space-y-2">
                            <h4 className="text-sm font-bold text-zinc-200">{assignment.title}</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-normal">{assignment.description}</p>
                            <span className="inline-block text-[10px] font-mono font-bold text-amber-500 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                              Tier Index: {assignment.difficulty}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-zinc-950/20 border border-zinc-800/40 p-4 rounded-xl space-y-2">
                              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Operational Target Milestones</h5>
                              <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1 pl-0.5">
                                {assignment.tasks?.map((task, idx) => <li key={idx} className="truncate">{task}</li>)}
                              </ul>
                            </div>
                            <div className="bg-zinc-950/20 border border-zinc-800/40 p-4 rounded-xl space-y-2">
                              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Evaluation Rules Summary</h5>
                              <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1 pl-0.5">
                                {assignment.evaluation_criteria?.map((criteria, idx) => <li key={idx} className="truncate">{criteria}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection.type === 'summary' && (
                    <div className="space-y-4">
                      <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-xl">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Synopsis Overview</h4>
                        <p className="text-zinc-300 text-xs leading-relaxed font-normal">{activeSection.content?.summary}</p>
                      </div>

                      {activeSection.content?.key_takeaways?.length > 0 && (
                        <div className="bg-zinc-950/20 border border-zinc-800/40 p-4 rounded-xl space-y-2">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Core Takeaways Ledger</h4>
                          <ul className="space-y-1.5">
                            {activeSection.content.key_takeaways.map((takeaway, tIndex) => (
                              <li key={tIndex} className="text-xs text-zinc-400 flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                <span className="leading-relaxed">{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeSection.content?.resources?.length > 0 && (
                        <div className="bg-zinc-950/20 border border-zinc-800/40 p-4 rounded-xl space-y-3">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reference Attachments</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeSection.content.resources.map((res, rIndex) => (
                              <a
                                key={rIndex}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 text-xs rounded-lg transition-all hover:border-zinc-700 group"
                              >
                                <span className="truncate font-medium text-zinc-300 group-hover:text-zinc-100">{res.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection?.type === 'video' && (
              <div className="bg-zinc-900/10 border border-zinc-800 rounded-xl p-5 space-y-1">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lecture Outline Context</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-normal">{activeSection.content}</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <h3 className="font-bold text-xs text-zinc-400 tracking-wider uppercase">Syllabus Index</h3>
              <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
                {course.modules.length} Blocks
              </span>
            </div>

            <div className="divide-y divide-zinc-800">
              {course.modules.map((module, mIdx) => {
                const isExpanded = !!expandedModules[module.id];
                return (
                  <div key={module.id} className="bg-zinc-900/5">
                    
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-zinc-800/10 transition-colors group"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="font-semibold text-xs text-zinc-300 group-hover:text-zinc-200 line-clamp-2">
                          {module.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
                          <span>{renderTimeRange(module.start_time, module.end_time)}</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="bg-zinc-950/20 border-t border-zinc-900/60 pb-1.5 divide-y divide-zinc-900/40">
                        {module.sections?.map((section, sIdx) => {
                          const isSectionActive = activeSection?.moduleId === module.id && activeSection?.sectionIndex === sIdx;
                          return (
                            <button
                              key={sIdx}
                              onClick={() => setActiveSection({ moduleId: module.id, sectionIndex: sIdx, ...section })}
                              className={`w-full p-3.5 text-left flex items-start gap-3 text-xs transition-all ${
                                isSectionActive 
                                  ? 'bg-zinc-800/30 border-l-2 border-amber-500 text-zinc-100 pl-3' 
                                  : 'hover:bg-zinc-800/10 text-zinc-400 hover:text-zinc-300'
                              }`}
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${isSectionActive ? 'text-amber-500' : 'text-zinc-500'}`}>
                                {getSectionIcon(section.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium line-clamp-2 mb-0.5 ${isSectionActive ? 'text-zinc-200 font-semibold' : 'text-zinc-400'}`}>
                                  {section.title}
                                </p>
                                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500">
                                  <span>{getSectionTypeLabel(section.type)}</span>
                                  {section.type === 'video' && section.start_time !== undefined && section.start_time !== null && (
                                    <span className="font-mono font-medium lowercase">
                                      @{formatTime(section.start_time)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
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
    </Navbar>
  );
};

export default CourseDetail;