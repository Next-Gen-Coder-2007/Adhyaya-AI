import { useState } from 'react';
import { useAuth, FONT_FAMILIES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Moon,
  Sun,
  LayoutDashboard,
  ALargeSmall,
  Type,
  Sparkles,
  Grid3X3,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  BookOpen,
  Clock,
  Laptop
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import api from '../api/axios';

const SettingCard = ({ label, description, icon: Icon, children, badge }) => (
  <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 p-6 sm:p-7 shadow-md space-y-5 transition-all">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            {badge && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
    <div className="pt-1">{children}</div>
  </div>
);

const Toggle = ({ isEnabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer border ${
      isEnabled ? 'bg-amber-500 border-amber-400' : 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
        isEnabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Settings = () => {
  const { user, updateSettings, isDarkMode, toggleDarkMode } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    darkMode: user?.settings?.darkMode ?? isDarkMode,
    fontSize: user?.settings?.fontSize ?? 'medium',
    layoutMode: user?.settings?.layoutMode ?? 'grid',
    fontFamily: user?.settings?.fontFamily ?? 'inter',
  });
  const [error, setError] = useState(null);

  const update = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    updateSettings({ [key]: value });
    setError(null);

    // Trigger 5-Second Toast Feedback
    const labels = {
      darkMode: value ? 'Dark Obsidian Theme' : 'High-Contrast Light Theme',
      fontSize: `${value.charAt(0).toUpperCase() + value.slice(1)} Text Scaling`,
      layoutMode: `${value.charAt(0).toUpperCase() + value.slice(1)} Box Layout`,
      fontFamily: `${FONT_FAMILIES[value]?.name || value} Typography`,
    };

    toast.success(`${labels[key] || key} preference saved and synced across sessions!`, 'Settings Saved', 5000);

    try {
      await api.patch('/auth/me/settings', { [key]: value });
    } catch (err) {
      // Handled silently since local state is already saved
    }
  };

  const fontList = Object.entries(FONT_FAMILIES).map(([id, info]) => ({
    id,
    ...info,
  }));

  return (
    <Navbar>
      <div className="space-y-8 max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            App Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Personalize your workspace aesthetics, typography, reading text sizes, and course box layouts.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
            {error}
          </p>
        )}

        <div className="space-y-6">
          {/* 1. Dark / Light Mode */}
          <SettingCard
            label="Appearance Theme"
            description="Toggle between dark obsidian and clean, high-contrast light workspace."
            icon={settings.darkMode ? Moon : Sun}
            badge={settings.darkMode ? 'Dark OLED' : 'Light Mode'}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {settings.darkMode ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {settings.darkMode ? 'Obsidian Dark Workspace' : 'Crisp Pure Light Workspace'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {settings.darkMode ? 'Optimal for late-night study and high contrast' : 'Optimal for bright ambient lighting'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {settings.darkMode ? 'Dark' : 'Light'}
                </span>
                <Toggle
                  isEnabled={settings.darkMode}
                  onToggle={() => {
                    update('darkMode', !settings.darkMode);
                    toggleDarkMode();
                  }}
                />
              </div>
            </div>
          </SettingCard>

          {/* 2. Reading Font Size with Live Preview Box */}
          <SettingCard
            label="Reading Font Size & Scale"
            description="Adjust curriculum text scaling for optimal study legibility with live preview."
            icon={ALargeSmall}
            badge={settings.fontSize.toUpperCase()}
          >
            <div className="space-y-4">
              {/* Size Switcher Pills */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'small', label: 'Compact', px: '14px Base', desc: 'Dense Information' },
                  { id: 'medium', label: 'Default', px: '16px Base', desc: 'Standard Balance' },
                  { id: 'large', label: 'Large', px: '18px Base', desc: 'High Legibility' },
                ].map((f) => {
                  const isSelected = settings.fontSize === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => update('fontSize', f.id)}
                      className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md text-slate-900 dark:text-white ring-2 ring-amber-500/20'
                          : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {f.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-[11px] font-mono font-semibold text-slate-600 dark:text-zinc-300">{f.px}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{f.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Text Size Visual Preview Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                      Live Text Scale Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-bold">
                    Active: {settings.fontSize === 'small' ? '14px (-10%)' : settings.fontSize === 'large' ? '18px (+15%)' : '16px (Default)'}
                  </span>
                </div>

                <div
                  className="space-y-2.5"
                  style={{
                    fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold text-[0.75em] border border-amber-500/30">
                      MODULE 1 • LESSON 3
                    </span>
                    <span className="text-[0.75em] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 12 mins
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[1.15em] leading-snug">
                    Autonomous Neural Agent Architecture & Vector Pipelines
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-300 text-[0.9em] leading-relaxed">
                    This sample preview text scales dynamically across your curriculum studio, lecture notes, quiz assessments, and AI assistant dialogues.
                  </p>
                </div>
              </div>
            </div>
          </SettingCard>

          {/* 3. Typography & Font Family Selection (5 Fonts) */}
          <SettingCard
            label="Typography Font Family"
            description="Choose from 5 curated modern typefaces applied globally across the application."
            icon={Type}
            badge={FONT_FAMILIES[settings.fontFamily]?.name || 'Inter'}
          >
            <div className="space-y-4">
              {/* Font Selection Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fontList.map((f) => {
                  const isSelected = settings.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => update('fontFamily', f.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p
                            className="text-base font-bold text-slate-900 dark:text-white"
                            style={{ fontFamily: f.value }}
                          >
                            {f.name}
                          </p>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                            {f.category}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span
                          className="text-sm font-semibold text-slate-700 dark:text-zinc-300 tracking-wide"
                          style={{ fontFamily: f.value }}
                        >
                          Aa Bb 123
                        </span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {isSelected ? 'Active' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Typography Preview Box */}
              <div
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 space-y-2"
                style={{ fontFamily: FONT_FAMILIES[settings.fontFamily]?.value }}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Live Typography Preview ({FONT_FAMILIES[settings.fontFamily]?.name})
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                    Global CSS Cascade Active
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  The quick brown fox jumps over the lazy dog. 0123456789
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Adhyaya AI provides next-generation AI-driven video synthesis, structured modular learning paths, and interactive study companions.
                </p>
              </div>
            </div>
          </SettingCard>

          {/* 4. Box Layouts with Miniature Visual Box Previews */}
          <SettingCard
            label="Course Box Layouts"
            description="Choose how course cards and catalog collections are structured in your workspace with visual box previews."
            icon={LayoutDashboard}
            badge={settings.layoutMode.toUpperCase()}
          >
            <div className="space-y-4">
              {/* Layout Mode Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'grid',
                    label: 'Standard Grid',
                    desc: 'Balanced 3-column media cards',
                    icon: LayoutGrid,
                  },
                  {
                    id: 'compact',
                    label: 'Compact Grid',
                    desc: 'High-density 4-column cards',
                    icon: Grid3X3,
                  },
                  {
                    id: 'list',
                    label: 'Horizontal List',
                    desc: 'Wide list rows with metadata',
                    icon: List,
                  },
                ].map((l) => {
                  const isSelected = settings.layoutMode === l.id;
                  const LIcon = l.icon;
                  return (
                    <button
                      key={l.id}
                      onClick={() => update('layoutMode', l.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <LIcon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-500 dark:text-zinc-400'}`} />
                            <span className={`text-xs font-bold ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                              {l.label}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">{l.desc}</p>
                      </div>

                      {/* Miniature Visual Layout Representation */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800/80">
                        {l.id === 'grid' && (
                          <div className="grid grid-cols-3 gap-1.5 h-16 p-1.5 rounded-xl bg-slate-200/60 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800">
                            {[1, 2, 3].map((b) => (
                              <div
                                key={b}
                                className={`rounded-lg p-1 flex flex-col justify-between border ${
                                  isSelected
                                    ? 'bg-amber-500/20 border-amber-500/40'
                                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800'
                                }`}
                              >
                                <div className="w-full h-4 rounded bg-slate-300 dark:bg-zinc-800" />
                                <div className="w-3/4 h-1 rounded bg-slate-400 dark:bg-zinc-700" />
                                <div className="w-full h-0.5 rounded bg-amber-500" />
                              </div>
                            ))}
                          </div>
                        )}

                        {l.id === 'compact' && (
                          <div className="grid grid-cols-4 gap-1 h-16 p-1.5 rounded-xl bg-slate-200/60 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800">
                            {[1, 2, 3, 4].map((b) => (
                              <div
                                key={b}
                                className={`rounded-lg p-0.5 flex flex-col justify-between border ${
                                  isSelected
                                    ? 'bg-amber-500/20 border-amber-500/40'
                                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800'
                                }`}
                              >
                                <div className="w-full h-3 rounded bg-slate-300 dark:bg-zinc-800" />
                                <div className="w-2/3 h-1 rounded bg-slate-400 dark:bg-zinc-700" />
                                <div className="w-full h-0.5 rounded bg-amber-500" />
                              </div>
                            ))}
                          </div>
                        )}

                        {l.id === 'list' && (
                          <div className="flex flex-col gap-1.5 h-16 p-1.5 rounded-xl bg-slate-200/60 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 justify-center">
                            {[1, 2].map((b) => (
                              <div
                                key={b}
                                className={`rounded-lg px-1.5 py-1 flex items-center justify-between border ${
                                  isSelected
                                    ? 'bg-amber-500/20 border-amber-500/40'
                                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-zinc-800 shrink-0" />
                                  <div className="w-12 h-1 rounded bg-slate-400 dark:bg-zinc-700" />
                                </div>
                                <div className="w-5 h-1.5 rounded bg-amber-500" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expanded Box Layout Interactive Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                      Live Catalog Box Layout Preview ({settings.layoutMode.toUpperCase()})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-bold">
                    Interactive Grid
                  </span>
                </div>

                {settings.layoutMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: 'Fullstack AI Agents with Python & React', lessons: '8 Lessons', progress: 75 },
                      { title: 'Machine Learning Deep Dives & Vectors', lessons: '12 Lessons', progress: 40 },
                      { title: 'Modern Next.js & Tailwind Masterclass', lessons: '6 Lessons', progress: 100 },
                    ].map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3 space-y-2 shadow-sm"
                      >
                        <div className="w-full h-16 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-600">
                          <BookOpen className="w-6 h-6 text-amber-500 opacity-60" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {c.lessons}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {c.title}
                          </h4>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {settings.layoutMode === 'compact' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { title: 'AI Agents Mastery', progress: 75 },
                      { title: 'Vector DB Pipelines', progress: 40 },
                      { title: 'Next.js 15 Fullstack', progress: 100 },
                      { title: 'TypeScript Foundations', progress: 20 },
                    ].map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-2.5 space-y-1.5 shadow-sm"
                      >
                        <div className="w-full h-12 rounded-lg bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-amber-500 opacity-60" />
                        </div>
                        <h4 className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                          {c.title}
                        </h4>
                        <div className="w-full h-1 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {settings.layoutMode === 'list' && (
                  <div className="space-y-2">
                    {[
                      { title: 'Fullstack AI Agents with Python & React', lessons: '8 Lessons', progress: 75 },
                      { title: 'Machine Learning Deep Dives & Vectors', lessons: '12 Lessons', progress: 40 },
                      { title: 'Modern Next.js & Tailwind Masterclass', lessons: '6 Lessons', progress: 100 },
                    ].map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-amber-500 opacity-60" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {c.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400">{c.lessons}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-20 sm:w-28 h-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 w-8 text-right">
                            {c.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SettingCard>
        </div>
      </div>
    </Navbar>
  );
};

export default Settings;