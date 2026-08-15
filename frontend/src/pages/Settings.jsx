import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Palette, LayoutDashboard, ALargeSmall, Check, Sparkles } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import api from '../api/axios';

const THEMES = [
  { id: 'amber', label: 'Amber Gold', color: '#f59e0b', desc: 'Warm glowing luxury gold' },
  { id: 'emerald', label: 'Emerald Matrix', color: '#10b981', desc: 'Modern neon green' },
  { id: 'indigo', label: 'Cyber Indigo', color: '#3b82f6', desc: 'Deep technological blue' },
  { id: 'purple', label: 'Amethyst Violet', color: '#a855f7', desc: 'AI intelligence purple' },
  { id: 'rose', label: 'Rose Quartz', color: '#f43f5e', desc: 'Vibrant punchy coral' },
];

const SettingCard = ({ label, description, icon: Icon, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-lg hover:border-zinc-800 transition-colors">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-500" style={{ color: 'var(--color-accent)' }} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="shrink-0 pl-14 sm:pl-0">{children}</div>
  </div>
);

const Toggle = ({ isEnabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer border ${
      isEnabled ? 'bg-amber-500 border-amber-400' : 'bg-zinc-800 border-zinc-700'
    }`}
    style={isEnabled ? { backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : {}}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
        isEnabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: user?.settings?.darkMode ?? true,
    themeColor: user?.settings?.themeColor ?? 'amber',
    fontSize: user?.settings?.fontSize ?? 'medium',
    layoutMode: user?.settings?.layoutMode ?? 'grid',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const update = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    updateSettings({ [key]: value });
    setError(null);

    try {
      setSaving(true);
      await api.patch('/auth/me/settings', { [key]: value });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSettings(settings);
      setError('Failed to sync settings to server. Retrying...');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Navbar>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            App Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Personalize your workspace aesthetics, themes, font sizes, and visual layouts.
          </p>
        </div>

        {error && <p className="text-xs text-red-400 p-3 rounded-xl bg-red-950/40 border border-red-800">{error}</p>}

        <div className="space-y-4">
          {/* Dark / Light Mode */}
          <SettingCard
            label="Appearance Theme"
            description="Toggle between dark and light workspace interface."
            icon={settings.darkMode ? Moon : Sun}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">
                {settings.darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <Toggle
                isEnabled={settings.darkMode}
                onToggle={() => update('darkMode', !settings.darkMode)}
              />
            </div>
          </SettingCard>

          {/* Theme Palette Swatches */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-lg space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5 text-amber-500" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Accent Theme Color</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select a bespoke color scheme applied across buttons, glows, and badges.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {THEMES.map((t) => {
                const isSelected = settings.themeColor === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => update('themeColor', t.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-white/20 shadow-xl'
                        : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full shadow-lg shrink-0"
                        style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}60` }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{t.label}</p>
                        <p className="text-[10px] text-zinc-500">{t.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Scaling */}
          <SettingCard
            label="Reading Font Size"
            description="Adjust curriculum text scaling for optimal study legibility."
            icon={ALargeSmall}
          >
            <div className="flex gap-2">
              {[
                { id: 'small', label: 'Compact' },
                { id: 'medium', label: 'Default' },
                { id: 'large', label: 'Large' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => update('fontSize', f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    settings.fontSize === f.id
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  style={
                    settings.fontSize === f.id
                      ? { backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }
                      : {}
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SettingCard>

          {/* Layout Mode */}
          <SettingCard
            label="Course Grid Layout"
            description="Choose how courses are presented in your catalogue."
            icon={LayoutDashboard}
          >
            <div className="flex gap-2">
              {[
                { id: 'grid', label: 'Grid' },
                { id: 'compact', label: 'Compact' },
                { id: 'list', label: 'List' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => update('layoutMode', l.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    settings.layoutMode === l.id
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  style={
                    settings.layoutMode === l.id
                      ? { backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }
                      : {}
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </SettingCard>
        </div>

        {saveSuccess && (
          <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Preferences saved and synced across sessions!
          </p>
        )}
      </div>
    </Navbar>
  );
};

export default Settings;