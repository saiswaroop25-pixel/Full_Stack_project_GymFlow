import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('gymflow_token'));
  const [loading, setLoading] = useState(true);

  // Rehydrate user from saved token on app load
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('gymflow_token');
      if (savedToken) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch {
          localStorage.removeItem('gymflow_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('gymflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('gymflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('gymflow_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => setUser(updated);

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
