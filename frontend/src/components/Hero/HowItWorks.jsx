import { Link2, Cpu, BookOpen, Trophy, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Link2,
    title: 'Paste YouTube URL',
    description: 'Provide any educational video or playlist link. Our system verifies video metadata and multi-language captions.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'Multi-Agent Processing',
    description: 'Curriculum agents analyze transcripts, structure milestones, generate assessments, and build vector embeddings.',
  },
  {
    step: '03',
    icon: BookOpen,
    title: 'Interactive Study Studio',
    description: 'Study through synchronized timelines, take timestamped scratchpad notes, and complete applied coding challenges.',
  },
  {
    step: '04',
    icon: Trophy,
    title: 'Assessments & RAG Guidance',
    description: 'Take instant quizzes, verify mastery, and ask your dedicated AI tutor questions with clickable timestamp links.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">
            How Adhyaya Works
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary,#a1a1aa)]">
            From raw video feed to complete interactive course in four automated steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 transition-colors font-mono">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary,#ffffff)] group-hover:text-amber-500 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary,#a1a1aa)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;