import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wifi, Dumbbell, CreditCard,
  Megaphone, BarChart3, Brain, Zap, ArrowLeft, Shield
} from 'lucide-react';

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard',          path: '/admin/dashboard' },
  { icon: Wifi,            label: 'Live Occupancy',     path: '/admin/occupancy', live: true },
  { icon: Users,           label: 'Manage Members',     path: '/admin/members' },
  { icon: Dumbbell,        label: 'Equipment',          path: '/admin/equipment' },
  { icon: CreditCard,      label: 'Subscriptions',      path: '/admin/subscriptions' },
  { icon: Megaphone,       label: 'Announcements',      path: '/admin/announcements' },
  { icon: BarChart3,       label: 'Analytics & Reports',path: '/admin/reports' },
  { icon: Brain,           label: 'AI Insights',        path: '/admin/ai-insights' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-void, #060608);
        }

        /* ── Admin Sidebar ── */
        .admin-sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 260px;
          background: #0d0d12;
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
        }

        /* Logo */
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          min-height: 72px;
          flex-shrink: 0;
        }
        .admin-logo-icon {
          width: 36px; height: 36px;
          background: var(--accent-orange, #ff6b35);
          color: #000;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .admin-logo-text {
          font-family: var(--font-display, 'Bebas Neue', cursive);
          font-size: 20px;
          letter-spacing: 0.1em;
          color: #f0f0f8;
          white-space: nowrap;
        }
        .admin-logo-text span { color: var(--accent-orange, #ff6b35); }

        /* Role pill */
        .admin-role-pill {
          margin: 12px 16px;
          padding: 8px 14px;
          background: rgba(255,107,53,0.1);
          border: 1px solid rgba(255,107,53,0.25);
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-orange, #ff6b35);
          flex-shrink: 0;
        }

        /* Nav */
        .admin-nav {
          flex: 1;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .admin-nav::-webkit-scrollbar { width: 4px; }
        .admin-nav::-webkit-scrollbar-track { background: transparent; }
        .admin-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .admin-nav-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.25);
          padding: 10px 12px 6px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-body, 'Space Grotesk', sans-serif);
          transition: all 0.15s ease;
          white-space: nowrap;
          position: relative;
          border: 1px solid transparent;
          cursor: pointer;
          background: none;
          width: 100%;
          text-align: left;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #f0f0f8;
        }
        .admin-nav-item.active {
          background: rgba(255,107,53,0.12);
          color: var(--accent-orange, #ff6b35);
          border-color: rgba(255,107,53,0.25);
        }
        .admin-nav-item.active svg { color: var(--accent-orange, #ff6b35); }

        .admin-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00ff87;
          margin-left: auto;
          flex-shrink: 0;
          animation: pulse-dot 2s infinite;
          box-shadow: 0 0 6px #00ff87;
        }

        /* Bottom */
        .admin-sidebar-bottom {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        /* Main */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 32px;
          min-height: 100vh;
          box-sizing: border-box;
        }

        @media (max-width: 900px) {
          .admin-sidebar { width: 220px; }
          .admin-main { margin-left: 220px; padding: 20px; }
        }
        @media (max-width: 680px) {
          .admin-sidebar { display: none; }
          .admin-main { margin-left: 0; }
        }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {/* Logo */}
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="admin-logo-text">GYM<span>ADMIN</span></span>
          </div>

          {/* Role pill */}
          <div className="admin-role-pill">
            <Shield size={12} />
            Admin Control Panel
          </div>

          {/* Navigation */}
          <nav className="admin-nav">
            <div className="admin-nav-label">Management</div>
            {adminNav.map(({ icon: Icon, label, path, live }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {live && <div className="admin-live-dot" />}
              </NavLink>
            ))}
          </nav>

          {/* Bottom */}
          <div className="admin-sidebar-bottom">
            <button
              className="admin-nav-item"
              onClick={() => navigate('/app/dashboard')}
            >
              <ArrowLeft size={17} />
              <span>Back to User App</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}