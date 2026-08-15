import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExploreClick = () => {
    const el = document.getElementById('ai-agents');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img
              src={logo}
              alt="Adhyaya AI Logo"
              className="w-8 h-8 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-base font-extrabold tracking-tight text-white">
              Adhyaya <span className="text-amber-500">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 px-4 py-4 space-y-2 rounded-b-2xl shadow-2xl">
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