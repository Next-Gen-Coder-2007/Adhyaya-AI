import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Calendar, BookOpen, Flame, Clock, TrendingUp,
  Edit2, Check, X, Lock
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import { Avatar } from '../components/Dashboard/Avatar';
import api from '../api/axios';

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${accent}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">{label}</p>
        {value != null ? (
          <p className="text-3xl font-bold text-white">{value}</p>
        ) : (
          <p className="text-sm text-zinc-700 mt-1">No data yet</p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl bg-white/5`}>
        <Icon className={`w-5 h-5 ${accent.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const EditableField = ({
  label,
  value,
  onSave,
  icon: Icon,
  isEditable = true,
  type = "text",
  placeholder = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (editValue.trim() === "") {
      setEditValue(value);
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-900">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white"
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-white/5 text-green-500 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditValue(value);
                setIsEditing(false);
              }}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-white/5 text-red-500 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-base text-white">
              {label === 'Password' ? '••••••••' : value || placeholder}
            </p>
            {isEditable && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses', { withCredentials: true });
        setCourses(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const getSections = (course) => course.modules?.flatMap(m => m.sections) || [];
  const totalCourses = courses.length;
  const completedCourses = courses.filter(course =>
    course.status === "completed" && getSections(course).every(s => s.completed)
  ).length;
  const pendingCourses = courses.filter(course => course.status !== "completed").length;
  const incompleteCourses = courses.filter(course =>
    getSections(course).some(s => !s.completed)
  ).length;

  const handleSave = async (field, value) => {
    try {
      const updateData = { [field]: value };
      const response = await api.put('/auth/me', updateData, { withCredentials: true });
      window.location.reload()
    } catch (error) {
      throw error;
    }
  };

  const isGoogleUser = user?.provider === 'google';

  const statCards = [
    { label: 'Enrolled Courses', value: totalCourses, icon: BookOpen, accent: 'bg-amber-500' },
    { label: 'Completed', value: completedCourses, icon: Flame, accent: 'bg-green-500' },
    { label: 'In Progress', value: incompleteCourses, icon: Clock, accent: 'bg-blue-500' },
    { label: 'Generating', value: pendingCourses, icon: TrendingUp, accent: 'bg-violet-500' },
  ];

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-2 text-sm text-zinc-600">Manage your personal information and track your progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1 rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar name={userData.name} size={10} />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">{userData.name}</h2>
                <p className="text-sm text-zinc-600">{userData.email}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <EditableField
                label="Name"
                value={userData.name}
                onSave={(value) => handleSave('name', value)}
                icon={User}
                isEditable={true}
                placeholder="Enter your name"
              />
              <EditableField
                label="Email"
                value={userData.email}
                onSave={(value) => handleSave('email', value)}
                icon={Mail}
                isEditable={!isGoogleUser}
                placeholder="Enter your email"
              />
              {user?.provider === 'local' && (
                <EditableField
                  label="Password"
                  value=""
                  onSave={(value) => handleSave('password', value)}
                  icon={Lock}
                  isEditable={true}
                  type="password"
                  placeholder="Enter new password"
                />
              )}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-widest">Joined</p>
                  <p className="text-base text-white">{user?.joinedDate || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="lg:col-span-2 rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-300 mb-6">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Profile;