import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Plus, Filter, Sparkles, X, LayoutGrid, LayoutList } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import CourseCard from '../components/Courses/CourseCard';
import CreateCourseModal from '../components/Courses/CreateCourseModal';
import api from '../api/axios';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in_progress', 'completed', 'generating'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const layout = user?.settings?.layoutMode ?? 'grid';

  const gridClass =
    layout === 'list'
      ? 'flex flex-col gap-4'
      : layout === 'compact'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses', { withCredentials: true });
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getSections = (course) => course.modules?.flatMap((m) => m.sections || []) || [];

  const filteredCourses = courses.filter((course) => {
    const titleMatch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'generating') return course.status === 'generating';

    const sections = getSections(course);
    const isCompleted = course.status === 'completed' && sections.length > 0 && sections.every((s) => s.completed);

    if (activeFilter === 'completed') return isCompleted;
    if (activeFilter === 'in_progress') return !isCompleted && course.status === 'completed';

    return true;
  });

  return (
    <Navbar>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Course Library
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Access your personalized AI-synthesized curricula and track learning milestones.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-amber-500/20 active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Course</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {[
              { id: 'all', label: 'All Courses', count: courses.length },
              {
                id: 'in_progress',
                label: 'In Progress',
                count: courses.filter((c) => {
                  const s = getSections(c);
                  return c.status === 'completed' && !s.every((sec) => sec.completed);
                }).length,
              },
              {
                id: 'completed',
                label: 'Completed',
                count: courses.filter((c) => {
                  const s = getSections(c);
                  return c.status === 'completed' && s.length > 0 && s.every((sec) => sec.completed);
                }).length,
              },
              {
                id: 'generating',
                label: 'Generating',
                count: courses.filter((c) => c.status === 'generating').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === tab.id ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            <p className="text-xs text-zinc-500">Retrieving your course catalogue...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className={gridClass}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => {
                  navigate(`/courses/${course.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-zinc-950 border border-zinc-900 p-8 space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No courses match your filter</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No courses matching "${searchQuery}". Try a different keyword.`
                  : 'Start by generating a new AI curriculum from any educational video.'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
            >
              Create Course
            </button>
          </div>
        )}

        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fetchCourses={fetchCourses}
        />
      </div>
    </Navbar>
  );
};

export default Courses;