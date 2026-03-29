import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';

export default function UserLayout() {
  const { user } = useApp();
  const navigate  = useNavigate();
  const [isAdmin, setIsAdmin]   = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('gymflow_theme') !== 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty('--bg-void',    '#060608');
      root.style.setProperty('--bg-deep',    '#0d0d12');
      root.style.setProperty('--bg-surface', '#12121a');
      root.style.setProperty('--bg-elevated','#1a1a26');
      root.style.setProperty('--bg-card',    '#1e1e2e');
      root.style.setProperty('--bg-hover',   '#252538');
      root.style.setProperty('--text-primary',   '#f0f0f8');
      root.style.setProperty('--text-secondary',  '#9090b0');
      root.style.setProperty('--text-muted',      '#555570');
      root.style.setProperty('--border-subtle',   'rgba(255,255,255,0.06)');
      root.style.setProperty('--border-medium',   'rgba(255,255,255,0.12)');
      localStorage.setItem('gymflow_theme', 'dark');
    } else {
      root.style.setProperty('--bg-void',    '#f4f4f8');
      root.style.setProperty('--bg-deep',    '#eaeaf0');
      root.style.setProperty('--bg-surface', '#e0e0ea');
      root.style.setProperty('--bg-elevated','#d8d8e8');
      root.style.setProperty('--bg-card',    '#ffffff');
      root.style.setProperty('--bg-hover',   '#ececf4');
      root.style.setProperty('--text-primary',   '#1a1a2e');
      root.style.setProperty('--text-secondary',  '#4a4a6a');
      root.style.setProperty('--text-muted',      '#8888aa');
      root.style.setProperty('--border-subtle',   'rgba(0,0,0,0.08)');
      root.style.setProperty('--border-medium',   'rgba(0,0,0,0.14)');
      localStorage.setItem('gymflow_theme', 'light');
    }
  }, [darkMode]);

  const handleToggleRole = (admin) => {
    setIsAdmin(admin);
    navigate(admin ? '/admin/dashboard' : '/app/dashboard');
  };

  return (
    <div className="app-layout">
      <Sidebar
        isAdmin={isAdmin}
        onToggleRole={handleToggleRole}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
