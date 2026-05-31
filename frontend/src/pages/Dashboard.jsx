import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, LayoutDashboard, BookOpen, Settings, User,
  Menu, X, Bell, ChevronRight, Flame, Clock, Star, TrendingUp
} from 'lucide-react';
import logo from '../assets/logo.png';

const Avatar = ({ name = 'U', size = 9 }) => (
  <div
    className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-amber-400 to-yellow-600
                flex items-center justify-center text-black font-bold text-sm shrink-0`}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

const NavLink = ({ item, onClick }) => (
  <a
    href={item.path}
    onClick={onClick}
    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg
               text-zinc-400 hover:text-white hover:bg-white/5
               transition-all duration-200 text-sm font-medium"
  >
    <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
    {item.name}
  </a>
);

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${accent}`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
        {value != null ? (
          <p className="text-3xl font-bold text-white">{value}</p>
        ) : (
          <p className="text-sm text-zinc-600 mt-1">No data yet</p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl bg-white/5`}>
        <Icon className={`w-5 h-5 ${accent.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const EmptySlot = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
      <Star className="w-4 h-4 text-zinc-600" />
    </div>
    <p className="text-xs text-zinc-600">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Courses',   icon: BookOpen,         path: '/courses'   },
    { name: 'Profile',   icon: User,             path: '/profile'   },
    { name: 'Settings',  icon: Settings,         path: '/settings'  },
  ];

  const stats = [
    { label: 'Enrolled Courses', value: user?.stats?.enrolled  ?? null, icon: BookOpen,    accent: 'bg-amber-400'  },
    { label: 'Completed',        value: user?.stats?.completed ?? null, icon: Flame,       accent: 'bg-green-400'  },
    { label: 'In Progress',      value: user?.stats?.ongoing   ?? null, icon: Clock,       accent: 'bg-blue-400'   },
    { label: 'Streak (days)',    value: user?.stats?.streak    ?? null, icon: TrendingUp,  accent: 'bg-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex font-sans antialiased">

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-30 h-screen w-64 shrink-0
          flex flex-col bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
          <img src={logo} alt="logo" className="w-7 h-7 rounded-lg" />
          <span className="text-base font-bold tracking-tight">Adhyaya <span className="text-amber-400">AI</span></span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-zinc-600">Menu</p>
          {navItems.map(item => (
            <NavLink key={item.name} item={item} onClick={closeSidebar} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-800 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-1">
            <Avatar name={user?.name} size={8} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                       text-zinc-500 hover:text-red-400 hover:bg-red-900/10
                       transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="sticky top-0 z-10 flex items-center justify-between
                           px-4 md:px-8 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden md:block">
            <p className="text-sm text-zinc-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-400 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar name={user?.name} size={8} />
              <span className="hidden sm:block text-sm font-medium">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-8">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back,{' '}
              <span className="text-amber-400">{user?.name?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Here's an overview of your learning journey.</p>
          </div>

          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

            <div className="lg:col-span-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-300">Continue Learning</h2>
                <a href="/courses" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  All courses <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              {user?.recentCourses?.length ? (
                <ul className="space-y-3">
                  {user.recentCourses.map((c, i) => (
                    <li key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.title}</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                            style={{ width: `${c.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{c.progress ?? 0}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptySlot label="You haven't started any courses yet." />
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-zinc-300">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { label: 'Browse Courses', icon: BookOpen, href: '/courses' },
                  { label: 'My Profile',     icon: User,     href: '/profile' },
                  { label: 'Settings',       icon: Settings, href: '/settings' },
                  { label: 'Achievements',   icon: Star,     href: '/achievements' },
                ].map(a => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                               bg-white/5 hover:bg-amber-400/10 hover:border-amber-400/30
                               border border-transparent transition-all duration-200 text-center group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 group-hover:bg-amber-400/10
                                    flex items-center justify-center transition-colors">
                      <a.icon className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-white transition-colors leading-tight">
                      {a.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;