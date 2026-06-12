import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Palette, LayoutDashboard, ALargeSmall } from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';
import api from '../api/axios';

const SettingCard = ({ label, description, icon: Icon, children }) => (
  <div className="flex items-center gap-4 p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-zinc-700 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
    <Icon className="w-5 h-5 text-accent" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ isEnabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      isEnabled ? 'bg-accent' : 'bg-[var(--bg-tertiary)]'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        isEnabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:border-accent focus:outline-none text-sm text-[var(--text-primary)] cursor-pointer"
  >
    {options.map(({ value, label }) => (
      <option key={value} value={value}>{label}</option>
    ))}
  </select>
);

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [settings, setSettings] = useState({
    darkMode:    user?.settings?.darkMode    ?? true,
    themeColor:  user?.settings?.themeColor  ?? 'amber',
    fontSize:    user?.settings?.fontSize    ?? 'medium',
    layoutMode:  user?.settings?.layoutMode  ?? 'grid',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);           // optimistic update
    setError(null);

    try {
      setSaving(true);
      await api.patch('/auth/me/settings', { [key]: value });
      updateSettings({
        [key]: value
      });
    } catch (err) {
      setSettings(settings);     // revert on failure
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-[var(--text-subtle)]">Customize your experience.</p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="space-y-3">
          <SettingCard label="Dark mode" description="Enable dark theme for the application." icon={Moon}>
            <Toggle
              isEnabled={settings.darkMode}
              onToggle={() => update('darkMode', !settings.darkMode)}
            />
          </SettingCard>

          <SettingCard label="Theme color" description="Choose the primary color for the app." icon={Palette}>
            <Select
              value={settings.themeColor}
              onChange={(v) => update('themeColor', v)}
              options={[
                { value: 'amber',  label: 'Amber'  },
                { value: 'blue',   label: 'Blue'   },
                { value: 'green',  label: 'Green'  },
                { value: 'purple', label: 'Purple' },
                { value: 'pink',   label: 'Pink'   },
              ]}
            />
          </SettingCard>

          <SettingCard label="Font size" description="Adjust text size for better readability." icon={ALargeSmall}>
            <Select
              value={settings.fontSize}
              onChange={(v) => update('fontSize', v)}
              options={[
                { value: 'small',  label: 'Small'  },
                { value: 'medium', label: 'Medium' },
                { value: 'large',  label: 'Large'  },
              ]}
            />
          </SettingCard>

          <SettingCard label="Layout mode" description="Choose how courses and content are displayed." icon={LayoutDashboard}>
            <Select
              value={settings.layoutMode}
              onChange={(v) => update('layoutMode', v)}
              options={[
                { value: 'grid',    label: 'Grid view'    },
                { value: 'list',    label: 'List view'    },
                { value: 'compact', label: 'Compact view' },
              ]}
            />
          </SettingCard>
        </div>

        {saving && (
          <p className="text-xs text-[var(--text-muted)]">Saving...</p>
        )}
      </div>
    </Navbar>
  );
};

export default Settings;