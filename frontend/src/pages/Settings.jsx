import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Moon,
  User,
  Mail,
  Lock,
  ChevronRight,
  Palette,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '../components/Dashboard/Navbar';

const SettingSection = ({ title, children }) => (
  <div className="rounded-2xl bg-zinc-950 border border-zinc-900 p-6">
    <h2 className="text-lg font-semibold text-zinc-300 mb-4">{title}</h2>
    {children}
  </div>
);

const SettingItem = ({ label, description, icon: Icon, children }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-amber-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-base font-medium text-white">{label}</p>
      {description && <p className="text-sm text-zinc-600 mt-1">{description}</p>}
      {children}
    </div>
  </div>
);

const ToggleSetting = ({ label, description, icon: Icon, isEnabled, onToggle }) => (
  <SettingItem label={label} description={description} icon={Icon}>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isEnabled ? 'bg-amber-500' : 'bg-zinc-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isEnabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </SettingItem>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: user?.settings?.darkMode ?? true,
    themeColor: user?.settings?.themeColor ?? 'amber',
    fontSize: user?.settings?.fontSize ?? 'medium',
    layoutMode: user?.settings?.layoutMode ?? 'grid',
  });

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    updateUser({ settings: newSettings });
  };

  const handleSelect = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateUser({ settings: newSettings });
  };

  return (
    <Navbar>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-zinc-600">Customize your experience.</p>
        </div>

        <div className="space-y-6">
          <SettingSection title="Preferences">
            <ToggleSetting
              label="Dark Mode"
              description="Enable dark theme for the application."
              icon={Moon}
              isEnabled={settings.darkMode}
              onToggle={() => handleToggle('darkMode')}
            />
          </SettingSection>

          <SettingSection title="Appearance">
            <SettingItem
              label="Theme Color"
              description="Choose the primary color theme for the app."
              icon={Palette}
            >
              <select
                value={settings.themeColor}
                onChange={(e) => handleSelect('themeColor', e.target.value)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white"
              >
                <option value="amber">Amber</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
              </select>
            </SettingItem>
            <SettingItem
              label="Font Size"
              description="Adjust the text size for better readability."
              icon={User}
            >
              <select
                value={settings.fontSize}
                onChange={(e) => handleSelect('fontSize', e.target.value)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </SettingItem>
            <SettingItem
              label="Layout Mode"
              description="Choose how courses and content are displayed."
              icon={LayoutDashboard}
            >
              <select
                value={settings.layoutMode}
                onChange={(e) => handleSelect('layoutMode', e.target.value)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="compact">Compact View</option>
              </select>
            </SettingItem>
          </SettingSection>

          <SettingSection title="Account">
            <SettingItem
              label="Change Name"
              description="Update your display name."
              icon={User}
            >
              <a
                href="/profile"
                className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors mt-2"
              >
                Edit <ChevronRight className="w-4 h-4" />
              </a>
            </SettingItem>
            <SettingItem
              label="Change Email"
              description="Update your email address."
              icon={Mail}
            >
              <a
                href="/profile"
                className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors mt-2"
              >
                Edit <ChevronRight className="w-4 h-4" />
              </a>
            </SettingItem>
            <SettingItem
              label="Change Password"
              description="Update your account password."
              icon={Lock}
            >
              <a
                href="/change-password"
                className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 transition-colors mt-2"
              >
                Edit <ChevronRight className="w-4 h-4" />
              </a>
            </SettingItem>
          </SettingSection>
        </div>
      </div>
    </Navbar>
  );
};

export default Settings;