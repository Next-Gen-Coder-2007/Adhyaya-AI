import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BookOpen, Flame, Clock, TrendingUp, Edit2, Check, X } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import { Avatar } from '../components/Dashboard/Avatar';

const StatItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-900">
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
      <Icon className="w-5 h-5 text-amber-500" />
    </div>
    <div>
      <p className="text-xs text-zinc-600 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  </div>
);

const EditableField = ({ label, value, onSave, icon: Icon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
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
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white"
            />
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg hover:bg-white/5 text-green-500 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditValue(value);
                setIsEditing(false);
              }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-base text-white">{value}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    joinedDate: user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '',
  });

  const handleSave = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    updateUser({ [field]: value });
  };

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-2 text-sm text-zinc-600">Manage your personal information and track your progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              />
              <EditableField
                label="Email"
                value={userData.email}
                onSave={(value) => handleSave('email', value)}
                icon={Mail}
              />
              <EditableField
                label="Bio"
                value={userData.bio}
                onSave={(value) => handleSave('bio', value)}
                icon={Edit2}
              />
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-widest">Joined</p>
                  <p className="text-base text-white">{userData.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-zinc-300 mb-6">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatItem label="Enrolled Courses" value={user?.stats?.enrolled ?? 0} icon={BookOpen} />
              <StatItem label="Completed" value={user?.stats?.completed ?? 0} icon={Flame} />
              <StatItem label="In Progress" value={user?.stats?.ongoing ?? 0} icon={Clock} />
              <StatItem label="Streak (days)" value={user?.stats?.streak ?? 0} icon={TrendingUp} />
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Profile;