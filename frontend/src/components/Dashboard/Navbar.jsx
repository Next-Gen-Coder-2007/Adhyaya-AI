import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Settings,
  User,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { Avatar } from './Avatar';

const NavLink = ({ item, onClick, isActive }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl
               transition-all duration-200 text-xs font-semibold cursor-pointer
               ${isActive
                 ? 'text-white bg-amber-500/15 border border-amber-500/30 font-bold shadow-sm'
                 : 'text-zinc-400 hover:text-white hover:bg-white/5'
               }`}
  >
    <item.icon
      className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-amber-400'}`}
    />
    <span>{item.name}</span>
  </Link>
);

const Navbar = ({ children }) => {
  const { user, logout, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Courses',   icon: BookOpen,         path: '/courses'   },
    { name: 'Profile',   icon: User,             path: '/profile'   },
    { name: 'Settings',  icon: Settings,         path: '/settings'  },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary,#09090b)] text-[var(--text-primary,#ffffff)] flex font-sans antialiased">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-30 h-screen w-64 shrink-0
          flex flex-col bg-[var(--bg-secondary,#121215)] border-r border-[var(--border,rgba(255,255,255,0.08))]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border,rgba(255,255,255,0.08))]">
          <img src={logo} alt="logo" className="w-8 h-8 rounded-xl shadow-md" />
          <span className="text-base font-extrabold tracking-tight">
            Adhyaya <span className="text-amber-500">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            Learning Workspace
          </p>
          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                item={item}
                onClick={closeSidebar}
                isActive={isActive}
              />
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="px-3 py-4 border-t border-[var(--border,rgba(255,255,255,0.08))] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <Avatar name={user?.name} size={8} />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.name || 'Learner'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl
                       text-zinc-500 hover:text-red-400 hover:bg-red-950/20
                       transition-all duration-200 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-lg"
          onClick={closeSidebar}
        />
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fixed Top Header */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-20 flex items-center justify-between
                           px-4 md:px-8 h-16 border-b border-[var(--border,rgba(255,255,255,0.08))] bg-[var(--glass-bg,rgba(9,9,11,0.85))] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 text-zinc-400 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden md:block">
              <p className="text-xs text-zinc-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border,rgba(255,255,255,0.08))] text-zinc-300 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* User Profile */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
            >
              <Avatar name={user?.name} size={8} />
              <span className="hidden sm:block text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area with Top Padding */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Navbar;