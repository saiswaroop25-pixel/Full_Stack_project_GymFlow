import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import {
  clearSession,
  persistSession,
  readStoredToken,
  readStoredUser,
} from '../api/session';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]       = useState(() => readStoredUser());
  const [token, setToken]     = useState(() => readStoredToken());
  const [loading, setLoading] = useState(true);

  // Rehydrate user from saved token on app load
  useEffect(() => {
    const init = async () => {
      const savedToken = readStoredToken();
      if (savedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          persistSession(savedToken, data.user);
        } catch {
          clearSession();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    persistSession(token, updated);
  };

  // Provide both new shape AND old shape so all existing components work
  const value = {
    // New API
    user, token, loading, login, register, logout, updateUser,
    // Old shape that Sidebar, UserDashboard etc expect
    isAdmin: user?.role === 'ADMIN',
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#060608',
        fontFamily: "'Bebas Neue', cursive", fontSize: 32,
        color: '#c8ff00', letterSpacing: '0.1em'
      }}>
        GYMFLOW
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Old hook — all existing components use this
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

// New hook — new components can use this
export const useAuth = () => useApp();

export default AppContext;
