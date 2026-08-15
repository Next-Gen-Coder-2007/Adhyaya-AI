import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
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
  Trophy
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import RecentCourseCard from '../components/Dashboard/RecentCourseCard';
import CreateCourseModal from '../components/Courses/CreateCourseModal';
import api from '../api/axios';

const StatCard = ({ label, value, icon: Icon, accent, subtitle }) => (
  <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] p-6 shadow-xl hover:border-amber-500/30 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-15 ${accent}`} />
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs text-[var(--text-muted,#71717a)] uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-3xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">{value ?? 0}</p>
        {subtitle && <p className="text-[11px] text-[var(--text-muted,#71717a)]">{subtitle}</p>}
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

  const pendingCourses = courses.filter((c) => c.status !== 'completed').length;
  const inProgressCourses = courses.filter((c) => {
    const secs = getSections(c);
    return secs.some((s) => s.completed) && !secs.every((s) => s.completed);
  }).length;

  const totalCompletedSections = courses.reduce((acc, c) => {
    return acc + getSections(c).filter((s) => s.completed).length;
  }, 0);

  const stats = [
    {
      label: 'Enrolled Courses',
      value: totalCourses,
      icon: BookOpen,
      accent: 'bg-amber-500',
      subtitle: `${pendingCourses} generating`,
    },
    {
      label: 'Completed Courses',
      value: completedCourses,
      icon: Trophy,
      accent: 'bg-amber-500',
      subtitle: `${totalCompletedSections} total lessons done`,
    },
    {
      label: 'In Progress',
      value: inProgressCourses || (totalCourses > 0 ? totalCourses - completedCourses : 0),
      icon: Clock,
      accent: 'bg-amber-500',
      subtitle: 'Active learning tracks',
    },
    {
      label: 'Learning Streak',
      value: '3 Days',
      icon: Flame,
      accent: 'bg-amber-500',
      subtitle: 'Keep up the momentum!',
    },
  ];

  return (
    <Navbar>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome Back
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
            </h1>
            <p className="text-sm text-[var(--text-secondary,#a1a1aa)] max-w-xl">
              Turn curiosity into mastery. Continue your AI-structured courses or create a new interactive module in seconds.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-500/20 active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
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

        {/* Learning Hub Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Continue Learning (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary,#ffffff)]">Recent Courses</h2>
                <p className="text-xs text-[var(--text-muted,#71717a)]">Pick up where you left off</p>
              </div>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span>View all ({totalCourses})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[var(--text-muted,#71717a)]">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs">Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <RecentCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border)] space-y-4">
                <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">No courses started yet</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Paste any YouTube video to generate your first interactive course.</p>
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
            <div className="rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted,#71717a)]">Quick Shortcuts</h2>
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
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))] hover:border-amber-500/40 hover:bg-[var(--bg-primary)] transition-all text-center group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center transition-colors">
                      <a.icon className="w-5 h-5 text-[var(--text-muted,#71717a)] group-hover:text-amber-500 transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary,#a1a1aa)] group-hover:text-[var(--text-primary,#ffffff)] transition-colors leading-tight">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Agent Features Highlight */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Multi-Agent System</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary,#ffffff)]">Interactive RAG AI Tutor</h3>
              <p className="text-xs text-[var(--text-secondary,#a1a1aa)] leading-relaxed">
                Every course is indexed with semantic embeddings. Open any course and ask your personal tutor questions anytime!
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