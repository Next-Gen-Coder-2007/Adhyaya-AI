import { useAuth } from '../context/AuthContext';
import { BookOpen, Flame, Clock, TrendingUp, ChevronRight, Star, User, Settings } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';

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

const EmptySlot = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-900 p-10 text-center">
    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
      <Star className="w-4 h-4 text-zinc-700" />
    </div>
    <p className="text-xs text-zinc-700">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Enrolled Courses', value: user?.stats?.enrolled ?? null, icon: BookOpen,    accent: 'bg-amber-500'  },
    { label: 'Completed',        value: user?.stats?.completed ?? null, icon: Flame,       accent: 'bg-green-500'  },
    { label: 'In Progress',      value: user?.stats?.ongoing  ?? null, icon: Clock,       accent: 'bg-blue-500'   },
    { label: 'Streak (days)',    value: user?.stats?.streak   ?? null, icon: TrendingUp,  accent: 'bg-violet-500' },
  ];

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back,{' '}
            <span className="text-amber-500">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Here's an overview of your learning journey.</p>
        </div>

        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-300">Continue Learning</h2>
              <a href="/courses" className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                All courses <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            {user?.recentCourses?.length ? (
              <ul className="space-y-4">
                {user.recentCourses.map((c, i) => (
                  <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium truncate">{c.title}</p>
                      <div className="mt-2 h-2 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-600"
                          style={{ width: `${c.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-zinc-600 shrink-0">{c.progress ?? 0}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptySlot label="You haven't started any courses yet." />
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-zinc-950 border border-zinc-900 p-6 flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-zinc-300">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { label: 'Browse Courses', icon: BookOpen, href: '/courses' },
                { label: 'My Profile',     icon: User,     href: '/profile' },
                { label: 'Settings',       icon: Settings, href: '/settings' },
                { label: 'Achievements',   icon: Star,     href: '/achievements' },
              ].map(a => (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl
                             bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30
                             border border-transparent transition-all duration-200 text-center group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 group-hover:bg-amber-500/10
                                  flex items-center justify-center transition-colors">
                    <a.icon className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-500 group-hover:text-white transition-colors leading-tight">
                    {a.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Navbar>
  );
};

export default Dashboard;