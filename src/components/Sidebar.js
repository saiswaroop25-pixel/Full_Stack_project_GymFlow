import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Users, Zap, Calendar, Dumbbell,
  BarChart3, UtensilsCrossed, Activity, Target,
  Clock, Bell, User, LogOut, Menu, X, ChevronRight,
  Shield
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Users, label: 'Live Crowd', path: '/app/crowd', badge: 'LIVE' },
  { icon: Calendar, label: 'Calendar Sync', path: '/app/calendar' },
  { icon: Dumbbell, label: 'Workout Logger', path: '/app/workout' },
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
  { icon: UtensilsCrossed, label: 'Diet Tracker', path: '/app/diet' },
  { icon: Activity, label: 'Activity', path: '/app/activity' },
  { icon: Target, label: 'Goals', path: '/app/goals' },
  { icon: Clock, label: 'Slot Booking', path: '/app/slots' },
  { icon: Bell, label: 'Notifications', path: '/app/notifications' },
  { icon: User, label: 'Profile', path: '/app/profile' },
];

export default function Sidebar() {
  const { user, notifications } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${collapsed ? '' : 'active'}`} onClick={() => setCollapsed(true)} />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Zap size={18} fill="currentColor" />
          </div>
          {!collapsed && <span className="logo-text">GYM<span>FLOW</span></span>}
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* User pill */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar">{user.avatar}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <span className="badge badge-green" style={{ fontSize: '9px' }}>{user.plan}</span>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ icon: Icon, label, path, badge }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span>{label}</span>
                  {badge === 'LIVE' && (
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div className="live-dot" style={{ width: 6, height: 6 }} />
                    </span>
                  )}
                  {label === 'Notifications' && notifications > 0 && (
                    <span className="nav-badge">{notifications}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate('/admin/dashboard')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Shield size={18} />
            {!collapsed && <span>Admin Panel</span>}
          </button>
          <button className="nav-item" onClick={() => navigate('/')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .sidebar.collapsed { width: 72px; }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
          min-height: 72px;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: var(--accent-green);
          color: #000;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 20px;
          letter-spacing: 0.1em;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .logo-text span { color: var(--accent-green); }
        .sidebar-toggle {
          margin-left: auto;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 28px; height: 28px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          margin: 12px 12px 4px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .sidebar-user:hover { border-color: var(--border-glow); }
        .avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px;
          color: #000;
          flex-shrink: 0;
        }
        .sidebar-user-name { font-size: 13px; font-weight: 700; white-space: nowrap; }
        .sidebar-user-info { display: flex; flex-direction: column; gap: 3px; }

        .sidebar-nav {
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .nav-item.active {
          background: var(--accent-green-dim);
          color: var(--accent-green);
          border: 1px solid rgba(0,255,135,0.2);
        }
        .nav-item.active svg { color: var(--accent-green); }

        .nav-badge {
          margin-left: auto;
          background: var(--accent-orange);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 100px;
        }

        .sidebar-bottom {
          padding: 12px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.collapsed { transform: translateX(0); width: 260px; }
        }
      `}</style>
    </>
  );
}
