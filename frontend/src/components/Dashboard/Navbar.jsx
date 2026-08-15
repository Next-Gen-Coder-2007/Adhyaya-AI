import { useState, useEffect, useRef } from 'react';
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
  Bell,
  Sun,
  Moon,
  Palette,
  Check
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { Avatar } from './Avatar';

const THEME_OPTIONS = [
  { id: 'amber', label: 'Amber Gold', color: '#f59e0b' },
  { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
  { id: 'indigo', label: 'Cyber Indigo', color: '#3b82f6' },
  { id: 'purple', label: 'Amethyst Violet', color: '#a855f7' },
  { id: 'rose', label: 'Rose Quartz', color: '#f43f5e' },
];

const NavLink = ({ item, onClick, isActive }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl
               transition-all duration-200 text-xs font-semibold cursor-pointer
               ${isActive
                 ? 'text-[var(--text-primary)] bg-accent-glow font-bold shadow-sm'
                 : 'text-zinc-400 hover:text-[var(--text-primary)] hover:bg-white/5'
               }`}
    style={
      isActive
        ? {
            backgroundColor: 'var(--color-accent-bg, rgba(245,158,11,0.15))',
            borderColor: 'var(--color-accent-border, rgba(245,158,11,0.3))',
            borderWidth: '1px',
            color: 'var(--text-primary)',
          }
        : {}
    }
  >
    <item.icon
      className="w-4 h-4 transition-colors shrink-0"
      style={isActive ? { color: 'var(--color-accent, #f59e0b)' } : {}}
    />
    <span>{item.name}</span>
  </Link>
);

const Navbar = ({ children }) => {
  const { user, logout, updateSettings } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isDarkMode = user?.settings?.darkMode !== false;
  const currentTheme = user?.settings?.themeColor || 'amber';

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !isDarkMode });
  };

  const selectTheme = (themeId) => {
    updateSettings({ themeColor: themeId });
    setThemeDropdownOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Courses',   icon: BookOpen,         path: '/courses'   },
    { name: 'Profile',   icon: User,             path: '/profile'   },
    { name: 'Settings',  icon: Settings,         path: '/settings'  },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary,#09090b)] text-[var(--text-primary,#ffffff)] flex font-sans antialiased transition-colors duration-300">
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
            Adhyaya <span style={{ color: 'var(--color-accent, #f59e0b)' }}>AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[var(--text-muted,#71717a)] font-bold">
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

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-10 flex items-center justify-between
                           px-4 md:px-8 h-16 border-b border-[var(--border,rgba(255,255,255,0.08))] bg-[var(--glass-bg,rgba(18,18,22,0.85))] backdrop-blur-xl">
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

          {/* Quick Header Controls: Theme Palette, Dark/Light Mode, Bell, Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Theme Color Picker */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border,rgba(255,255,255,0.08))] text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                title="Change Theme Palette"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent, #f59e0b)', boxShadow: '0 0 8px var(--color-accent-glow)' }}
                />
                <span className="hidden sm:inline capitalize">{currentTheme}</span>
                <Palette className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-[var(--bg-secondary,#121215)] border border-[var(--border-strong,rgba(255,255,255,0.15))] shadow-2xl z-50 space-y-1">
                  <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    Theme Color
                  </p>
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => selectTheme(opt.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                        currentTheme === opt.id
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span>{opt.label}</span>
                      </div>
                      {currentTheme === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border,rgba(255,255,255,0.08))] text-zinc-300 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* User Avatar */}
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

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Navbar;