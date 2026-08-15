import { useState } from 'react';
import {
  Layers,
  FileText,
  CheckCircle,
  Terminal,
  Compass,
  Bot,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const agents = [
  {
    id: 'curriculum',
    name: 'Curriculum Agent',
    role: 'Structure & Prerequisites',
    icon: Layers,
    accent: 'from-amber-500 to-amber-600',
    description: 'Deconstructs transcripts, maps logical milestones, and organizes content into hierarchical course modules.',
    capability: 'Synthesizes module hierarchy & prerequisite sequences.',
  },
  {
    id: 'content',
    name: 'Content Structuring Agent',
    role: 'Timeline & Synopses',
    icon: FileText,
    accent: 'from-amber-500 to-amber-600',
    description: 'Maps timeline start/end points, extracts core definitions, and writes comprehensive lesson summaries.',
    capability: 'Synchronizes timestamps with transcript highlights.',
  },
  {
    id: 'quiz',
    name: 'Assessment Generation Agent',
    role: 'Retention & Grading',
    icon: CheckCircle,
    accent: 'from-amber-500 to-amber-600',
    description: 'Generates MCQs, True/False, and conceptual questions with detailed explanation feedback for every section.',
    capability: 'Client-side automated grading with mastery scoring.',
  },
  {
    id: 'lab',
    name: 'Practical Lab Agent',
    role: 'Hands-on Projects',
    icon: Terminal,
    accent: 'from-amber-500 to-amber-600',
    description: 'Creates real-world engineering missions, difficulty tags, milestone checklists, and evaluation rubrics.',
    capability: 'Applied implementation tasks for active skill building.',
  },
  {
    id: 'resource',
    name: 'Resource Curator Agent',
    role: 'References & Docs',
    icon: Compass,
    accent: 'from-amber-500 to-amber-600',
    description: 'Curates external official documentation, cheat sheets, and deep-dive technical articles.',
    capability: 'Expands concept mastery beyond the video stream.',
  },
  {
    id: 'tutor',
    name: 'RAG AI Tutor Agent',
    role: 'Conversational Companion',
    icon: Bot,
    accent: 'from-amber-500 to-amber-600',
    description: 'Retrieves relevant transcript chunks to answer questions with exact [MM:SS] clickable video timestamp links.',
    capability: 'Context-grounded multi-turn conversational RAG.',
  },
];

const AIAgents = () => {
  const [activeAgent, setActiveAgent] = useState(agents[0]);

  return (
    <section id="ai-agents" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary,#ffffff)] tracking-tight">
            Decoupled Multi-Agent Architecture
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary,#a1a1aa)]">
            Each course is synthesized by a team of autonomous AI agents orchestrated through LangChain, Groq Llama 3.3 70B, and Gemini Flash.
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const isSelected = activeAgent.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[var(--bg-tertiary,#1c1c21)] border-amber-500/50 shadow-2xl scale-[1.02]'
                    : 'bg-[var(--bg-secondary,#121215)] border-[var(--border,rgba(255,255,255,0.08))] hover:border-amber-500/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${agent.accent} flex items-center justify-center text-black shadow-lg`}
                    >
                      <agent.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      {agent.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary,#ffffff)] group-hover:text-amber-500 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary,#a1a1aa)] mt-2 leading-relaxed font-normal">
                      {agent.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border,rgba(255,255,255,0.08))] flex items-center justify-between text-[11px] text-[var(--text-muted,#71717a)]">
                  <span className="truncate pr-2">{agent.capability}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AIAgents;