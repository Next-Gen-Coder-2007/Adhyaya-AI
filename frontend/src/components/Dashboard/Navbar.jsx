import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, BookOpen, Settings, User, Menu, X, Bell } from 'lucide-react';
import logo from '../../assets/logo.png';
import { Avatar } from './Avatar';


const NavLink = ({ item, onClick, isActive }) => (
  <a
    href={item.path}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg
               transition-all duration-200 text-sm font-medium
               ${isActive
                 ? 'text-white bg-amber-500/10 border border-amber-500/30'
                 : 'text-zinc-500 hover:text-white hover:bg-white/5'
               }`}
  >
    <item.icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-zinc-600 group-hover:text-amber-400'} transition-colors`} />
    {item.name}
  </a>
);

const Navbar = ({ children }) => {
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-zinc-950 text-white flex font-sans antialiased">
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-30 h-screen w-64 shrink-0
          flex flex-col bg-zinc-950 border-r border-zinc-900
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-zinc-900">
            <img src={logo} alt="logo" className="w-7 h-7 rounded-lg" />
            <span className="text-base font-bold tracking-tight">Adhyaya <span className="text-amber-500">AI</span></span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-zinc-700">Menu</p>
          {navItems.map(item => {
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

        <div className="px-3 py-4 border-t border-zinc-900 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-1">
            <Avatar name={user?.name} size={8} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-600 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                       text-zinc-600 hover:text-red-400 hover:bg-red-900/20
                       transition-all duration-200 text-sm font-medium cursor-pointer"
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-10 flex items-center justify-between
                           px-4 md:px-8 h-14 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-lg">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-500"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden md:block">
            <p className="text-sm text-zinc-600">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar name={user?.name} size={8} />
              <span className="hidden sm:block text-sm font-medium">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-16 md:pt-18 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Navbar;