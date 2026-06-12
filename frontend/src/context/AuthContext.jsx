// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
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
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateSettings = (newSettings) => {
    setUser((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  if (!initialized) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginAuth, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);