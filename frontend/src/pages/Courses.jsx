import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, Flame, Search, Filter, ChevronRight, PlayCircle, Plus, X } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import CourseCard from '../components/Courses/CourseCard';
import CreateCourseModal from '../components/Courses/CreateCourseModal';
import api from '../api/axios';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const layout = user?.settings?.layoutMode ?? 'grid';

  const gridClass = layout === 'list'
    ? 'flex flex-col gap-4'
    : layout === 'compact'
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';


  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Navbar>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Courses</h1>
            <p className="mt-2 text-sm text-zinc-600">Explore and continue your learning journey.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-medium hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-lg font-medium text-zinc-500">No courses found</p>
            <p className="text-sm text-zinc-600 mt-1">Try adjusting your search or filters.</p>
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