import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--glass-bg,rgba(9,9,11,0.85))] backdrop-blur-xl border-b border-[var(--border,rgba(255,255,255,0.08))] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img
              src={logo}
              alt="Adhyaya AI Logo"
              className="w-8 h-8 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-base font-extrabold tracking-tight text-[var(--text-primary,#ffffff)]">
              Adhyaya <span className="text-amber-500">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--border,rgba(255,255,255,0.08))] text-[var(--text-secondary,#a1a1aa)] hover:text-[var(--text-primary,#ffffff)] transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary,#a1a1aa)] hover:text-[var(--text-primary,#ffffff)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border,rgba(255,255,255,0.08))] text-[var(--text-secondary,#a1a1aa)] cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-[var(--text-secondary,#a1a1aa)] hover:text-[var(--text-primary,#ffffff)] cursor-pointer"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--bg-secondary,#121215)] border-t border-[var(--border,rgba(255,255,255,0.08))] px-4 py-4 space-y-2 rounded-b-2xl shadow-2xl">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-3 py-2 text-xs font-medium text-[var(--text-secondary,#a1a1aa)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;