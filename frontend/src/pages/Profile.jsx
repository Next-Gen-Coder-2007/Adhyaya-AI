import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  BookOpen,
  Flame,
  Clock,
  TrendingUp,
  Edit2,
  Check,
  X,
  Lock,
  Trophy,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import { Avatar } from '../components/Dashboard/Avatar';
import api from '../api/axios';

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 shadow-md">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 ${accent}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value ?? 0}</p>
      </div>
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
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
  type = 'text',
  placeholder = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (editValue.trim() === '') {
      setEditValue(value);
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
      <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-amber-500" style={{ color: 'var(--color-accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-1.5 min-w-0 mt-1">
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 w-full px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 shadow-sm"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditValue(value);
                setIsEditing(false);
              }}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/30 transition-colors cursor-pointer shrink-0"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {label === 'Password' ? '••••••••••••' : value || placeholder}
            </p>
            {isEditable && (
              <button
                onClick={() => {
                  setEditValue(value || '');
                  setIsEditing(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses', { withCredentials: true });
        setCourses(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const getSections = (course) => course.modules?.flatMap((m) => m.sections || []) || [];
  const totalCourses = courses.length;
  const completedCourses = courses.filter((course) => {
    const secs = getSections(course);
    return course.status === 'completed' && secs.length > 0 && secs.every((s) => s.completed);
  }).length;
  const pendingCourses = courses.filter((course) => course.status !== 'completed').length;
  const inProgressCourses = courses.filter((course) => {
    const secs = getSections(course);
    return secs.some((s) => s.completed) && !secs.every((s) => s.completed);
  }).length;

  const handleSave = async (field, value) => {
    try {
      const updateData = { [field]: value };
      await api.put('/auth/me', updateData, { withCredentials: true });
      setUserData((prev) => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error('Failed to update profile field:', error);
    }
  };

  const isGoogleUser = user?.provider === 'google';

  const statCards = [
    { label: 'Total Enrolled', value: totalCourses, icon: BookOpen, accent: 'bg-amber-500' },
    { label: 'Completed', value: completedCourses, icon: Trophy, accent: 'bg-green-500' },
    { label: 'In Progress', value: inProgressCourses, icon: Clock, accent: 'bg-blue-500' },
    { label: 'Generating', value: pendingCourses, icon: TrendingUp, accent: 'bg-purple-500' },
  ];

  const badges = [
    {
      title: 'Pioneer Learner',
      desc: 'Created first AI curriculum',
      unlocked: totalCourses > 0,
      icon: Sparkles,
    },
    {
      title: 'Knowledge Finisher',
      desc: 'Completed an entire course',
      unlocked: completedCourses > 0,
      icon: Trophy,
    },
    {
      title: 'Fast Learner',
      desc: 'Completed 5+ learning sections',
      unlocked: courses.flatMap((c) => getSections(c)).filter((s) => s.completed).length >= 5,
      icon: Zap,
    },
    {
      title: 'Honor Scholar',
      desc: 'Scored 100% on a module quiz',
      unlocked: courses.flatMap((c) => getSections(c)).some((s) => s.quiz_score === 100),
      icon: Award,
    },
  ];

  return (
    <Navbar>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Manage your credentials, study achievements, and learning milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Profile Card (1 Col) */}
          <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 space-y-6 shadow-md">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <Avatar name={userData.name || 'User'} size={12} />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userData.name || 'Student'}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-500 truncate max-w-[200px]">{userData.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                  {user?.provider === 'google' ? 'Google Account' : 'Standard Member'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-900">
              <EditableField
                label="Full Name"
                value={userData.name}
                onSave={(val) => handleSave('name', val)}
                icon={User}
                isEditable={true}
                placeholder="Your name"
              />
              <EditableField
                label="Email Address"
                value={userData.email}
                onSave={(val) => handleSave('email', val)}
                icon={Mail}
                isEditable={!isGoogleUser}
                placeholder="Your email"
              />
              {!isGoogleUser && (
                <EditableField
                  label="Password"
                  value=""
                  onSave={(val) => handleSave('password', val)}
                  icon={Lock}
                  isEditable={true}
                  type="password"
                  placeholder="Enter new password"
                />
              )}
            </div>
          </div>

          {/* Stats and Achievements (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 sm:p-8 space-y-4 shadow-md">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                Learning Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {statCards.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>

            {/* Badges / Achievements Gallery */}
            <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 sm:p-8 space-y-4 shadow-md">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                Unlocked Honors & Badges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                      b.unlocked
                        ? 'bg-slate-50 dark:bg-zinc-900/80 border-amber-500/30 text-slate-800 dark:text-zinc-200 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200/60 dark:border-zinc-900 text-slate-400 dark:text-zinc-600 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        b.unlocked
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-slate-200/70 dark:bg-zinc-900 text-slate-400 dark:text-zinc-700'
                      }`}
                    >
                      <b.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${b.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {b.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-tight mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Profile;