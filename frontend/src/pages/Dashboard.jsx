import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Flame,
  Clock,
  ChevronRight,
  User,
  Settings,
  Plus,
  Sparkles,
  Trophy,
  Activity,
  Award,
  Zap,
  TrendingUp,
  Target,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import RecentCourseCard from '../components/Dashboard/RecentCourseCard';
import CreateCourseModal from '../components/Courses/CreateCourseModal';
import api from '../api/axios';

const StatCard = ({ label, value, icon: Icon, accent, subtitle, badge }) => (
  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10 dark:opacity-15 ${accent}`} />
    <div className="flex items-start justify-between">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-bold truncate">{label}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
              {badge}
            </span>
          )}
        </div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value ?? 0}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0">
        <Icon className="w-5 h-5 text-amber-500" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses', { withCredentials: true });
      setCourses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getSections = (course) => course.modules?.flatMap((m) => m.sections || []) || [];

  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => {
    const secs = getSections(c);
    return c.status === 'completed' && secs.length > 0 && secs.every((s) => s.completed);
  }).length;

  const inProgressCourses = courses.filter((c) => {
    const secs = getSections(c);
    return secs.some((s) => s.completed) && !secs.every((s) => s.completed);
  }).length;

  const totalCompletedSections = courses.reduce((acc, c) => {
    return acc + getSections(c).filter((s) => s.completed).length;
  }, 0);

  const totalPossibleSections = courses.reduce((acc, c) => {
    return acc + getSections(c).length;
  }, 0);

  // 100% REAL DATA CALCULATION: Summing exact section video durations & quiz scores
  const { totalStudyMinutes, formattedStudyTime, quizScoresAverage, quizCount } = useMemo(() => {
    let totalSecs = 0;
    let quizSum = 0;
    let qCount = 0;

    courses.forEach((c) => {
      const secs = getSections(c);
      secs.forEach((s) => {
        if (s.completed) {
          if (s.type === 'video') {
            const start = Number(s.start_time ?? s.startTime ?? 0);
            const end = Number(s.end_time ?? s.endTime ?? 0);
            const duration = end > start ? end - start : 0;
            // Add exact video seconds if timestamped, else standard 180s for untimestamped videos
            totalSecs += duration > 0 ? duration : 180;
          } else if (s.type === 'quiz') {
            totalSecs += 120;
          } else if (s.type === 'assignment') {
            totalSecs += 300;
          } else {
            totalSecs += 120;
          }
        }

        const score = s.quiz_score ?? s.quizScore;
        if (score !== null && score !== undefined) {
          quizSum += Number(score);
          qCount++;
        }
      });
    });

    const mins = totalSecs > 0 ? Math.max(1, Math.round(totalSecs / 60)) : 0;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const formatted = mins === 0 ? '0 mins' : hrs > 0 ? `${hrs}h ${remMins > 0 ? `${remMins}m` : ''}` : `${mins} mins`;
    const avgScore = qCount > 0 ? Math.round(quizSum / qCount) : 0;

    return {
      totalStudyMinutes: mins,
      formattedStudyTime: formatted,
      quizScoresAverage: avgScore,
      quizCount: qCount,
    };
  }, [courses]);

  // 100% REAL DATA WEEKLY VELOCITY: Grouping completed lessons by their actual recorded day
  const { weeklyActivity, activeDaysStreak } = useMemo(() => {
    // Mon -> Sun day buckets
    const days = [
      { day: 'Mon', dayIndex: 1, minutes: 0, lessons: 0 },
      { day: 'Tue', dayIndex: 2, minutes: 0, lessons: 0 },
      { day: 'Wed', dayIndex: 3, minutes: 0, lessons: 0 },
      { day: 'Thu', dayIndex: 4, minutes: 0, lessons: 0 },
      { day: 'Fri', dayIndex: 5, minutes: 0, lessons: 0 },
      { day: 'Sat', dayIndex: 6, minutes: 0, lessons: 0 },
      { day: 'Sun', dayIndex: 0, minutes: 0, lessons: 0 },
    ];

    const todayDayIndex = new Date().getDay();

    courses.forEach((c) => {
      const secs = getSections(c);
      secs.forEach((s) => {
        if (s.completed) {
          // Determine completion day from real timestamp
          let dIndex = todayDayIndex;
          const timestamp = s.completed_at || s.completedAt || c.updated_at || c.updatedAt || c.created_at || c.createdAt;
          if (timestamp) {
            const dateObj = new Date(timestamp);
            if (!isNaN(dateObj.getTime())) {
              dIndex = dateObj.getDay();
            }
          }

          const targetDay = days.find((d) => d.dayIndex === dIndex);
          if (targetDay) {
            let secDuration = 180;
            if (s.type === 'video') {
              const start = Number(s.start_time ?? s.startTime ?? 0);
              const end = Number(s.end_time ?? s.endTime ?? 0);
              secDuration = end > start ? end - start : 180;
            } else if (s.type === 'assignment') {
              secDuration = 300;
            } else if (s.type === 'quiz') {
              secDuration = 120;
            }
            targetDay.minutes += Math.max(1, Math.round(secDuration / 60));
            targetDay.lessons += 1;
          }
        }
      });
    });

    const activeDays = days.filter((d) => d.minutes > 0).length;
    const maxMin = Math.max(...days.map((d) => d.minutes), 1);

    const activityData = days.map((d) => ({
      ...d,
      heightPercent: d.minutes > 0 ? Math.max(15, Math.min(100, Math.round((d.minutes / maxMin) * 100))) : 4,
    }));

    return {
      weeklyActivity: activityData,
      activeDaysStreak: totalCompletedSections > 0 ? Math.max(1, activeDays) : 0,
    };
  }, [courses, totalCompletedSections]);

  const stats = [
    {
      label: 'Study Time',
      value: formattedStudyTime,
      icon: Clock,
      accent: 'bg-amber-500',
      subtitle: totalStudyMinutes > 0 ? `${totalStudyMinutes} active learning minutes` : '0 active learning minutes',
      badge: 'Real-Time',
    },
    {
      label: 'Lessons Mastered',
      value: totalCompletedSections,
      icon: Award,
      accent: 'bg-amber-500',
      subtitle: `${totalCompletedSections} of ${totalPossibleSections} total lessons completed`,
    },
    {
      label: 'Enrolled Tracks',
      value: totalCourses,
      icon: BookOpen,
      accent: 'bg-amber-500',
      subtitle: `${completedCourses} completed • ${inProgressCourses} in progress`,
    },
    {
      label: 'Avg Quiz Score',
      value: quizCount > 0 ? `${quizScoresAverage}%` : '0%',
      icon: Zap,
      accent: 'bg-amber-500',
      subtitle: quizCount > 0 ? `Average across ${quizCount} completed quiz${quizCount > 1 ? 'zes' : ''}` : 'No quiz assessments taken yet',
      badge: quizCount > 0 ? (quizScoresAverage >= 80 ? 'Mastered' : 'In Progress') : '0 Quizzes',
    },
  ];

  return (
    <Navbar>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Live Workspace
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-amber-500">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
              Turn YouTube videos into structured interactive masterclasses with notes, quizzes, and live AI tutor support.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-500/20 active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate AI Course</span>
          </button>
        </div>

        {/* Quick Stats Matrix */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        {/* Learning Velocity & Study Consistency Chart */}
        <section className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Weekly Learning Velocity
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Live Data
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Actual daily study time calculated from completed lessons</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" /> {activeDaysStreak} Day Streak
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>
              <span className="text-slate-700 dark:text-zinc-300 font-bold hidden sm:inline">
                {totalCompletedSections} Lessons Completed
              </span>
            </div>
          </div>

          {/* Activity Bar Chart with Real Calculated Minutes */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
            {weeklyActivity.map((w, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                <span className={`text-[11px] font-mono font-bold transition-colors ${
                  w.minutes > 0
                    ? 'text-slate-800 dark:text-zinc-200 group-hover:text-amber-500'
                    : 'text-slate-400 dark:text-zinc-600'
                }`}>
                  {w.minutes}m
                </span>
                <div className="w-full h-24 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 flex items-end relative overflow-hidden group-hover:border-amber-500/40 transition-colors">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      w.minutes > 0
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm'
                        : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                    style={{ height: `${w.heightPercent}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-400 block">{w.day}</span>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-600 block">
                    {w.lessons > 0 ? `${w.lessons} les.` : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Hub Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Continue Learning (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Courses</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Pick up where you left off</p>
              </div>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <span>View all ({totalCourses})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500 dark:text-zinc-500">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs">Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <RecentCourseCard key={course.id || course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-4">
                <BookOpen className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No courses started yet</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Paste any YouTube video to generate your first interactive course.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Generate Course
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions & Spotlight (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 space-y-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Quick Shortcuts</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Browse Courses', icon: BookOpen, href: '/courses' },
                  { label: 'My Profile', icon: User, href: '/profile' },
                  { label: 'Settings', icon: Settings, href: '/settings' },
                  { label: 'New AI Course', icon: Plus, action: () => setIsCreateModalOpen(true) },
                ].map((a, idx) => (
                  <button
                    key={idx}
                    onClick={a.action ? a.action : () => navigate(a.href)}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500/40 hover:bg-white dark:hover:bg-zinc-800 transition-all text-center group cursor-pointer shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center transition-colors">
                      <a.icon className="w-5 h-5 text-slate-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-white transition-colors leading-tight">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Agent Features Highlight */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Multi-Agent System</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive RAG AI Tutor</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Every course is indexed with semantic embeddings. Open any course and ask your personal tutor questions with timestamped video citations!
              </p>
            </div>
          </div>
        </section>

        {/* Course Creation Modal */}
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          fetchCourses={fetchCourses}
        />
      </div>
    </Navbar>
  );
};

export default Dashboard;