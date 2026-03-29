import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Sun, Moon } from 'lucide-react';
import './Sidebar.css';

const userNav = [
  { to: '/app/dashboard',     icon: '⬡', label: 'Dashboard' },
  { to: '/app/crowd',         icon: '◉', label: 'Live Crowd' },
  { to: '/app/calendar',      icon: '▦', label: 'Calendar Sync' },
  { to: '/app/workout',       icon: '◈', label: 'Workout Logger' },
  { to: '/app/analytics',     icon: '◎', label: 'Analytics' },
  { to: '/app/diet',          icon: '◇', label: 'Diet Tracker' },
  { to: '/app/activity',      icon: '◌', label: 'Activity' },
  { to: '/app/goals',         icon: '◎', label: 'Goals' },
  { to: '/app/slots',         icon: '▣', label: 'Slot Booking' },
  { to: '/app/notifications',  icon: '◈', label: 'Notifications' },
  { to: '/app/profile',       icon: '◯', label: 'Profile' },
];

const adminNav = [
  { to: '/admin/dashboard',     icon: '⬡', label: 'Dashboard' },
  { to: '/admin/occupancy',     icon: '◉', label: 'Live Occupancy' },
  { to: '/admin/members',       icon: '◯', label: 'Manage Members' },
  { to: '/admin/equipment',     icon: '◈', label: 'Equipment' },
  { to: '/admin/subscriptions', icon: '▦', label: 'Subscriptions' },
  { to: '/admin/announcements', icon: '◇', label: 'Announcements' },
  { to: '/admin/reports',       icon: '◎', label: 'Analytics & Reports' },
  { to: '/admin/ai-insights',   icon: '◌', label: 'AI Insights' },
];

export default function Sidebar({ isAdmin = false, onToggleRole, darkMode, onToggleDark }) {
  const navigate  = useNavigate();
  const { user, logout } = useApp();
  const nav = isAdmin ? adminNav : userNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GF';

  const planColors = { BASIC: '#9090b0', PREMIUM: '#c8ff00', STUDENT: '#ffd166', ANNUAL: '#00d4ff' };
  const planColor  = planColors[user?.plan] || '#9090b0';

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/app/dashboard')}>
        <div className="logo-icon"><span>GF</span></div>
        <div className="logo-text">
          <span className="logo-main">GYM</span>
          <span className="logo-accent">FLOW</span>
        </div>
      </div>

      {/* Role toggle — only show if user is ADMIN */}
      {user?.role === 'ADMIN' && (
        <div className="sidebar-role-toggle">
          <button className={`role-btn ${!isAdmin ? 'active' : ''}`} onClick={() => onToggleRole(false)}>Member</button>
          <button className={`role-btn ${isAdmin ? 'active' : ''}`}  onClick={() => onToggleRole(true)}>Admin</button>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">{isAdmin ? 'MANAGEMENT' : 'MY FITNESS'}</div>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard' || item.to === '/app/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-footer">

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDark}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User info */}
        <div className="sidebar-user">
          <div className="user-avatar" style={{ borderColor: planColor, color: planColor }}>
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-plan" style={{ color: planColor }}>
              {user?.plan || 'Basic'} Member
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            color: '#ff6b6b', fontSize: 13, marginTop: 8, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,59,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,59,0.08)'; }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
