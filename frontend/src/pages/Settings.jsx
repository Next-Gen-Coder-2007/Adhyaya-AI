import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LayoutDashboard, ALargeSmall, Check, Sparkles } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import api from '../api/axios';

const SettingCard = ({ label, description, icon: Icon, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-lg hover:border-zinc-800 transition-colors">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-500" />
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
      setError('Failed to sync settings to server.');
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
            Personalize your workspace aesthetics, reading font sizes, and catalog layouts.
          </p>
        </div>

        {error && <p className="text-xs text-red-400 p-3 rounded-xl bg-red-950/40 border border-red-800">{error}</p>}

        <div className="space-y-4">
          {/* Dark / Light Mode */}
          <SettingCard
            label="Appearance Theme"
            description="Toggle between dark obsidian and high-contrast light workspace."
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

          {/* Reading Font Size */}
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
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SettingCard>

          {/* Layout Mode */}
          <SettingCard
            label="Course Grid Layout"
            description="Choose how courses are presented in your catalog."
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