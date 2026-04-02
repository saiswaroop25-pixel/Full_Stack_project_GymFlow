import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Sun, Moon, Zap } from 'lucide-react';

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
  { to: '/app/notifications', icon: '◈', label: 'Notifications' },
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

const PLAN_COLORS = { BASIC: '#9090b0', PREMIUM: '#c8ff00', STUDENT: '#ffd166', ANNUAL: '#00d4ff' };

export default function Sidebar({ isAdmin = false, onToggleRole, darkMode, onToggleDark }) {
  const navigate         = useNavigate();
  const { user, logout } = useApp();
  const nav              = isAdmin ? adminNav : userNav;

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials     = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'GF';
  const planColor    = PLAN_COLORS[user?.plan] || '#9090b0';

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
      background: 'var(--bg-deep)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      overflowY: 'auto', overflowX: 'hidden',
    }}>

      {/* Logo */}
      <div onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/app/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, background: '#c8ff00', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={18} fill="#000" color="#000" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
          GYM<span style={{ color: '#c8ff00' }}>FLOW</span>
        </span>
      </div>

      {/* Role toggle — admin only */}
      {user?.role === 'ADMIN' && (
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {[{ label: 'Member', admin: false }, { label: 'Admin', admin: true }].map(({ label, admin }) => (
            <button key={label} onClick={() => onToggleRole(admin)} style={{
              flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: isAdmin === admin ? '#c8ff00' : 'var(--bg-elevated)',
              color:      isAdmin === admin ? '#000'    : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '4px 10px 8px' }}>
          {isAdmin ? 'MANAGEMENT' : 'MY FITNESS'}
        </div>
        {nav.map(item => (
          <NavLink key={item.to} to={item.to}
            end={item.to === '/admin/dashboard' || item.to === '/app/dashboard'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              color:      isActive ? '#c8ff00' : 'var(--text-secondary)',
              background: isActive ? 'rgba(200,255,0,0.08)' : 'transparent',
              borderLeft: `2px solid ${isActive ? '#c8ff00' : 'transparent'}`,
              transition: 'all 0.15s',
            })}>
            <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>

        {/* Dark/Light toggle */}
        <button onClick={onToggleDark} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.2s',
        }}>
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: `2px solid ${planColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 14, color: planColor, flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: planColor, fontWeight: 600 }}>
              {user?.plan || 'BASIC'} Member
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
          color: '#ff6b6b', fontSize: 13, transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,59,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,59,59,0.08)'}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
