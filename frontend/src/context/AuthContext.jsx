// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const AuthContext = createContext();

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

const getInitialSettings = () => {
  try {
    const saved = localStorage.getItem("adhyaya_theme_settings");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return { darkMode: true, themeColor: "amber", fontSize: "medium", layoutMode: "grid" };
};

export const applyThemeToDOM = (settings) => {
  if (!settings) return;
  const root = document.documentElement;

  // 1. Theme color
  const theme = settings.themeColor || "amber";
  root.setAttribute("data-theme", theme);
  root.style.setProperty('--color-accent', THEME_COLORS[theme] || '#f59e0b');

  // 2. Font size
  const fontSize = settings.fontSize || "medium";
  root.setAttribute("data-font-size", fontSize);
  root.style.fontSize = FONT_SIZES[fontSize] || '16px';

  // 3. Dark/Light mode
  const isDark = settings.darkMode !== false;
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
    document.body.classList.remove("light");
    document.body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
  }

  // Persist locally
  try {
    localStorage.setItem("adhyaya_theme_settings", JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
};

// Immediate application on bundle load
applyThemeToDOM(getInitialSettings());

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(getInitialSettings);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    applyThemeToDOM(settings);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me", { skipToast: true, silent: true });
        setUser(res.data);
        if (res.data?.settings) {
          const merged = { ...getInitialSettings(), ...res.data.settings };
          setSettings(merged);
          applyThemeToDOM(merged);
        }
      } catch {
        setUser(null);
        applyThemeToDOM(settings);
      } finally {
        setInitialized(true);
      }
    };
    checkAuth();
  }, []);

  const loginAuth = async (endpoint, payload) => {
    const resAuth = await api.post(endpoint, payload);
    if (resAuth.data?.token) {
      localStorage.setItem('adhyaya_token', resAuth.data.token);
    }
    const res = await api.get('/auth/me');
    setUser(res.data);
    if (res.data?.settings) {
      const merged = { ...settings, ...res.data.settings };
      setSettings(merged);
      applyThemeToDOM(merged);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('adhyaya_token');
    setUser(null);
  };

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    applyThemeToDOM(merged);
    if (user) {
      setUser((prev) => (prev ? { ...prev, settings: merged } : null));
      try {
        await api.patch("/auth/me/settings", newSettings, { skipToast: true, silent: true });
      } catch (e) {
        // Backend sync error silently handled as local state is already responsive
      }
    }
  };

  const isDarkMode = settings.darkMode !== false;

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !isDarkMode });
  };

  if (!initialized) return <Loader />;

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        isDarkMode,
        toggleDarkMode,
        isAuthenticated: !!user,
        loginAuth,
        logout,
        updateSettings,
        applyThemeToDOM,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);