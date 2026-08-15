import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
  Zap,
  BookOpen,
  Film,
  Bot,
  Layers,
  FileCheck2,
  ShieldCheck,
  Flame
} from 'lucide-react';

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 30;
      const y = (clientY / innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative pt-20 pb-20 lg:pt-32 lg:pb-36 overflow-hidden"
    >
      {/* Dynamic Parallax Background Gradient Orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full blur-[150px] opacity-25 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, var(--color-accent, #f59e0b) 0%, rgba(168,85,247,0.35) 60%, transparent 80%)',
          transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5 + scrollY * 0.25}px))`,
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1 + scrollY * -0.15}px)`,
        }}
      />
      <div
        className="absolute top-40 left-10 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8 + scrollY * 0.2}px)`,
        }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
        {/* Top Tag Pill with Floating Micro-Parallax */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[var(--color-accent,#f59e0b)] backdrop-blur-md shadow-xl transition-transform duration-300"
          style={{
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Agent AI Learning OS</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight leading-[1.08] transition-transform duration-300"
            style={{
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          >
            Turn YouTube Videos Into <br className="hidden sm:inline" />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"
              style={{
                backgroundImage: 'var(--accent-gradient, linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%))',
              }}
            >
              Interactive Masterclasses
            </span>
          </h1>

          <p
            className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary,#a1a1aa)] max-w-2xl mx-auto leading-relaxed font-normal pt-2 transition-transform duration-300"
            style={{
              transform: `translateY(${scrollY * -0.03}px)`,
            }}
          >
            No more passive watching. Adhyaya AI breaks video streams into milestone modules with synchronized notes, instant practice quizzes, coding labs, and a RAG AI tutor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            style={{
              background: 'var(--accent-gradient, linear-gradient(135deg, #f59e0b 0%, #d97706 100%))',
            }}
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
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-[var(--text-primary,#ffffff)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Architecture</span>
          </button>
        </div>

        {/* Floating Parallax Badges & Studio Preview Container */}
        <div className="pt-12 max-w-5xl mx-auto relative">
          {/* Parallax Floating Badge 1 - Top Left */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl absolute -top-4 -left-10 z-20 transition-transform duration-500 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5 + scrollY * -0.18}px)`,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white">+4 Quizzes Synthesized</p>
              <p className="text-[9px] text-zinc-400 font-mono">Automated Assessment</p>
            </div>
          </div>

          {/* Parallax Floating Badge 2 - Top Right */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl absolute -top-6 -right-10 z-20 transition-transform duration-500 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6 + scrollY * -0.24}px)`,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white">99.8% Context Precision</p>
              <p className="text-[9px] text-zinc-400 font-mono">Transcript Grounded RAG</p>
            </div>
          </div>

          {/* Parallax Floating Badge 3 - Bottom Left */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-blue-500/30 shadow-2xl backdrop-blur-xl absolute -bottom-6 -left-8 z-20 transition-transform duration-500 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4 + scrollY * -0.12}px)`,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white">Live Timestamp Notes</p>
              <p className="text-[9px] text-zinc-400 font-mono">1-Click Bookmark</p>
            </div>
          </div>

          {/* Parallax Floating Badge 4 - Bottom Right */}
          <div
            className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl absolute -bottom-8 -right-8 z-20 transition-transform duration-500 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5 + scrollY * -0.22}px)`,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white">Interactive AI Tutor</p>
              <p className="text-[9px] text-zinc-400 font-mono">Clickable [MM:SS] Video Seek</p>
            </div>
          </div>

          {/* Studio Preview Card with 3D Parallax Tilt */}
          <div
            className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ease-out"
            style={{
              transform: `perspective(1000px) rotateX(${Math.max(-6, Math.min(6, (mousePos.y * 0.1) - (scrollY * 0.01)))}deg) rotateY(${mousePos.x * 0.1}deg) translateY(${scrollY * -0.04}px)`,
            }}
          >
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 font-medium">
                Adhyaya Study Studio — React 18 Architecture
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                LIVE STUDIO
              </span>
            </div>

            {/* Inner Mock Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-zinc-950/90 rounded-b-2xl text-left">
              {/* Video Mock (7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-purple-500/10" />
                  <div className="w-14 h-14 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] text-zinc-300 font-mono bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md">
                    <span>04:12 / 18:45</span>
                    <span className="text-amber-400 font-bold">1.25x Speed</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">Section 2: Virtual DOM Reconciliation</h4>
                    <span className="text-[10px] font-mono text-zinc-400">03:40 - 08:15</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    Understanding the fiber tree, diffing algorithm, and batching state updates in React concurrent mode.
                  </p>
                </div>
              </div>

              {/* Interactive Quiz & AI Tutor Mock (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                {/* Quiz Pill */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Practice Assessment
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                      Score: 100%
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">
                    Why does React batch consecutive setState calls?
                  </p>
                  <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>To optimize rendering performance & minimize layout thrashing.</span>
                  </div>
                </div>

                {/* AI Tutor Chat Mock */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Bot className="w-4 h-4" />
                    <span>AI Learning Tutor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
                    <p className="leading-relaxed">
                      "Reconciliation happens at <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]"><Clock className="w-2.5 h-2.5"/>[05:20]</span> during the commit phase."
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
