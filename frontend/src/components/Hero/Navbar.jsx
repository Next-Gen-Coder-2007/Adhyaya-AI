import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExploreClick = () => {
    const el = document.getElementById('ai-agents');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--glass-bg,rgba(9,9,11,0.85))] backdrop-blur-xl border-b border-[var(--border,rgba(255,255,255,0.08))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Adhyaya AI Logo" className="w-8 h-8 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
            <span className="text-base font-extrabold tracking-tight text-white">
              Adhyaya <span style={{ color: 'var(--color-accent,#f59e0b)' }}>AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleExploreClick}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Multi-Agent Architecture
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
              style={{
                background: 'var(--accent-gradient, linear-gradient(135deg, #f59e0b 0%, #d97706 100%))',
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 px-4 py-4 space-y-2">
            <button
              onClick={() => {
                handleExploreClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 rounded-xl"
            >
              Multi-Agent Architecture
            </button>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl"
              style={{
                background: 'var(--accent-gradient, linear-gradient(135deg, #f59e0b 0%, #d97706 100%))',
              }}
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