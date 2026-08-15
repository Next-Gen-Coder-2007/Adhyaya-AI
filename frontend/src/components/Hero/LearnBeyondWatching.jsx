import { XCircle, CheckCircle2, Sparkles } from 'lucide-react';

const LearnBeyondWatching = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Heading */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Active Learning Paradigm</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">
            Stop Passive Watching. <br />
            <span className="text-amber-500">Start Active Mastering.</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary,#a1a1aa)]">
            Watching tutorials gives an illusion of competence. Adhyaya AI forces active recall, comprehension checks, and applied implementation.
          </p>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Way */}
          <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">Traditional YouTube</span>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary,#ffffff)]">Passive Video Stream</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary,#a1a1aa)] leading-relaxed">
                Hours of linear footage without milestones, assessments, or contextual guidance.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Unstructured timeline with no concept grouping',
                  'Zero retention checks or knowledge verification',
                  'Manual note taking that breaks learning momentum',
                  'No way to ask questions about specific video timestamps',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[var(--text-secondary,#a1a1aa)]">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-100/60 dark:bg-black/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 font-medium text-center">
              "You remember only 10% of what you watch passively after 48 hours."
            </div>
          </div>

          {/* Adhyaya AI Solution */}
          <div className="p-8 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-amber-500/30 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  Adhyaya AI Platform
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary,#ffffff)]">Synthesized Study Studio</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary,#a1a1aa)] leading-relaxed">
                A structured, guided learning operating system that reinforces every single lesson.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Hierarchical modules with synchronized start/end timestamps',
                  'Instant section-wise practice quizzes with immediate feedback',
                  'Hands-on practical mission labs with objective checklists',
                  'Dedicated RAG AI Tutor with clickable video citations',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[var(--text-primary,#ffffff)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 font-semibold text-center relative z-10">
              "Active practice and retrieval increase long-term concept retention by 400%."
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnBeyondWatching;