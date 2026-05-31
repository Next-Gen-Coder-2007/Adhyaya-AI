import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, Flame, Search, Filter, ChevronRight, PlayCircle } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';

const CourseCard = ({ course, onClick }) => (
  <div
    onClick={onClick}
    className="group rounded-2xl bg-zinc-950 border border-zinc-900 p-5 hover:border-amber-500/30 transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
        <BookOpen className="w-6 h-6 text-amber-500" />
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-400">
        {course.category || 'General'}
      </span>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
    <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{course.description}</p>
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {course.duration || '0h'}
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> {course.difficulty || 'Beginner'}
        </span>
      </div>
      <PlayCircle className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
    </div>
  </div>
);

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourses(user?.courses || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'enrolled' && user?.enrolledCourses?.includes(course.id)) ||
                         (filter === 'completed' && user?.completedCourses?.includes(course.id));
    return matchesSearch && matchesFilter;
  });

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Courses</h1>
          <p className="mt-2 text-sm text-zinc-600">Explore and continue your learning journey.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('enrolled')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                filter === 'enrolled'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Enrolled
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                filter === 'completed'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => {
                  // Navigate to course detail page
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-lg font-medium text-zinc-500">No courses found</p>
            <p className="text-sm text-zinc-600 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default Courses;