import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-[var(--border,rgba(255,255,255,0.08))] bg-[var(--bg-secondary,#121215)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Adhyaya AI Logo" className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-extrabold tracking-tight text-white">
              Adhyaya <span style={{ color: 'var(--color-accent,#f59e0b)' }}>AI</span>
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Adhyaya AI. Agentic learning operating system.
          </p>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;