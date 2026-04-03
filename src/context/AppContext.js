import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AppContext = createContext(null);
const TOKEN_KEY = 'gymflow_token';
const USER_KEY = 'gymflow_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const persistSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export function AppProvider({ children }) {
  const [user, setUser]       = useState(() => readStoredUser());
  const [token, setToken]     = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Rehydrate user from saved token on app load
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
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
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
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
