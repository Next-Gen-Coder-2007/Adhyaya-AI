import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Ambient Background Glows */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #f59e0b 0%, rgba(217,119,6,0.2) 60%, transparent 80%)',
        }}
      />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-40 left-10 w-80 h-80 rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Agent AI Learning OS</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Turn YouTube Videos Into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">
              Interactive Masterclasses
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal pt-2">
            No more passive watching. Adhyaya AI breaks video streams into milestone modules with synchronized notes, instant practice quizzes, coding labs, and a RAG AI tutor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Learning Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              const el = document.getElementById('ai-agents');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Features</span>
          </button>
        </div>

        {/* Floating Badges & Studio Preview Container */}
        <div className="pt-10 max-w-5xl mx-auto relative">
          {/* Badge 1 - Top Left */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0a0a0d] border border-amber-500/30 shadow-xl shadow-amber-500/5 absolute -top-4 -left-8 z-20 animate-float-slow pointer-events-none">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white">+4 Quizzes Synthesized</p>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono">Automated Assessment</p>
            </div>
          </div>

          {/* Badge 2 - Top Right */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0a0a0d] border border-amber-500/30 shadow-xl shadow-amber-500/5 absolute -top-6 -right-8 z-20 animate-float-slow pointer-events-none"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white">99.8% Context Precision</p>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono">Transcript Grounded RAG</p>
            </div>
          </div>

          {/* Studio Preview Card */}
          <div className="relative rounded-3xl p-2 sm:p-3 bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 shadow-2xl">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/60 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-medium">
                Adhyaya Study Studio — React 18 Architecture
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                LIVE STUDIO
              </span>
            </div>

            {/* Inner Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-slate-50/70 dark:bg-[#050505] rounded-b-2xl text-left">
              {/* Video Mock (7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-600/10" />
                  <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] text-zinc-300 font-mono bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-md">
                    <span>04:12 / 18:45</span>
                    <span className="text-amber-400 font-bold">1.25x Speed</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Section 2: Virtual DOM Reconciliation</h4>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">03:40 - 08:15</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2">
                    Understanding the fiber tree, diffing algorithm, and batching state updates in React concurrent mode.
                  </p>
                </div>
              </div>

              {/* Quiz & AI Tutor Mock (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                {/* Quiz Pill */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Practice Assessment
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold">
                      Score: 100%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Why does React batch consecutive setState calls?
                  </p>
                  <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>To optimize rendering performance & minimize layout thrashing.</span>
                  </div>
                </div>

                {/* AI Tutor Chat Mock */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Bot className="w-4 h-4" />
                    <span>AI Learning Tutor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-[11px] text-slate-700 dark:text-zinc-300 space-y-1.5">
                    <p className="leading-relaxed">
                      "Reconciliation happens at <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]"><Clock className="w-2.5 h-2.5"/>[05:20]</span> during the commit phase."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
