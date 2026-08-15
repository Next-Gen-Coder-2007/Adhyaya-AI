import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-zinc-950 to-zinc-900 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[var(--color-accent,#f59e0b)] relative z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Learning Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight relative z-10">
            Transform Any YouTube Video <br className="hidden sm:inline" />
            Into a Masterclass in Seconds.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed relative z-10">
            Join learners using Adhyaya AI to generate structured curricula, practice quizzes, and RAG tutor support.
          </p>

          <div className="pt-2 relative z-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              style={{
                background: 'var(--accent-gradient, linear-gradient(135deg, #f59e0b 0%, #d97706 100%))',
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;