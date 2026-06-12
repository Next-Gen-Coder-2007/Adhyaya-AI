import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';

const THEME_COLORS = {
  amber:  '#f59e0b',
  blue:   '#3b82f6',
  green:  '#22c55e',
  purple: '#a855f7',
  pink:   '#ec4899',
};

const FONT_SIZES = {
  small:  '14px',
  medium: '16px',
  large:  '18px',
};

function SettingsApplier({ children }) {
  const { user } = useAuth();
  const s = user?.settings;

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', THEME_COLORS[s?.themeColor] ?? THEME_COLORS.amber);
    document.documentElement.style.fontSize = FONT_SIZES[s?.fontSize] ?? FONT_SIZES.medium;
    document.body.classList.toggle('light', !(s?.darkMode ?? true));
  }, [s?.themeColor, s?.fontSize, s?.darkMode]);

  return children;
}

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <SettingsApplier>
        <App />
      </SettingsApplier>
    </AuthProvider>
  </GoogleOAuthProvider>
);