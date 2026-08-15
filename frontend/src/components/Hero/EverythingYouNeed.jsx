import {
  Layout,
  FileText,
  CheckCircle,
  Terminal,
  Bot,
  Download,
  Sparkles,
  Palette,
  ShieldCheck
} from 'lucide-react';

const features = [
  {
    icon: Layout,
    title: 'Hierarchical Milestones',
    description: 'Videos are automatically organized into modules and sections, eliminating cognitive overload.',
  },
  {
    icon: FileText,
    title: 'Timestamped Synopses',
    description: 'Instant key takeaways and definitions bound to specific video intervals for rapid review.',
  },
  {
    icon: CheckCircle,
    title: 'Automated Quizzes',
    description: 'Reinforce learning with instant client-side grading, detailed explanations, and score tracking.',
  },
  {
    icon: Terminal,
    title: 'Hands-on Project Labs',
    description: 'Real-world coding exercises and mission checklists designed directly from lecture content.',
  },
  {
    icon: Bot,
    title: 'Context-Grounded AI Tutor',
    description: 'Ask questions anytime and receive answers citing exact [MM:SS] video timestamps.',
  },
  {
    icon: Download,
    title: 'Markdown Notes Export',
    description: 'Download the entire synthesized syllabus and your timestamped study notes with one click.',
  },
];

const EverythingYouNeed = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[var(--color-accent,#f59e0b)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Learning Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">
            Everything You Need to Master Any Topic
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary,#a1a1aa)]">
            A comprehensive suite of cognitive learning tools synthesized automatically from video sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-900 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl space-y-4 group"
            >
              <div
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform"
                style={{ color: 'var(--color-accent)' }}
              >
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EverythingYouNeed;