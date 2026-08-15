// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const AuthContext = createContext();

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

  // 2. Font size
  const fontSize = settings.fontSize || "medium";
  root.setAttribute("data-font-size", fontSize);

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        if (res.data?.settings) {
          const merged = { ...getInitialSettings(), ...res.data.settings };
          applyThemeToDOM(merged);
        }
      } catch {
        setUser(null);
        applyThemeToDOM(getInitialSettings());
      } finally {
        setInitialized(true);
      }
    };
    checkAuth();
  }, []);

  const loginAuth = async (endpoint, payload) => {
    await api.post(endpoint, payload);
    const res = await api.get("/auth/me");
    setUser(res.data);
    if (res.data?.settings) {
      applyThemeToDOM(res.data.settings);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateSettings = async (newSettings) => {
    setUser((prev) => {
      const merged = { ...(prev?.settings || getInitialSettings()), ...newSettings };
      applyThemeToDOM(merged);
      return prev ? { ...prev, settings: merged } : null;
    });

    try {
      await api.patch("/auth/me/settings", newSettings);
    } catch (e) {
      // Backend sync error silently handled as local state is already responsive
    }
  };

  if (!initialized) return <Loader />;

  return (
    <AuthContext.Provider
      value={{
        user,
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