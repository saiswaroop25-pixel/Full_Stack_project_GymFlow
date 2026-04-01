import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config';
import { Bell, Users, Dumbbell, Megaphone, AlertTriangle, CheckCircle } from 'lucide-react';

const TYPE_ICONS = {
  crowd:    { icon: Users,          color: '#00ff87' },
  slot:     { icon: CheckCircle,    color: '#00d4ff' },
  workout:  { icon: Dumbbell,       color: '#a78bfa' },
  alert:    { icon: AlertTriangle,  color: '#ff3b3b' },
  offer:    { icon: Megaphone,      color: '#ffd166' },
  update:   { icon: Bell,           color: '#00d4ff' },
  default:  { icon: Bell,           color: '#9090b0' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO for live notifications
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen for announcements broadcast by admin
    socket.on('announcement', (data) => {
      setNotifications(prev => [{
        id:    Date.now(),
        type:  data.type || 'update',
        title: data.title,
        body:  data.message,
        time:  'Just now',
        read:  false,
        live:  true,
      }, ...prev]);
    });

    // Listen for crowd alerts
    socket.on('crowd:alert', (data) => {
      setNotifications(prev => [{
        id:    Date.now(),
        type:  'alert',
        title: 'Crowd Alert',
        body:  data.message,
        time:  'Just now',
        read:  false,
        live:  true,
      }, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const clearAll = () => setNotifications([]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">NOTIFICATIONS</h1>
          <p className="page-subtitle">
            Live updates via Socket.IO ·{' '}
            <span style={{ color: connected ? '#00ff87' : '#ff3b3b', fontWeight: 600 }}>
              {connected ? '● Connected' : '● Disconnected'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>}
          {notifications.length > 0 && <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>}
        </div>
      </div>

      {/* Info banner */}
      <div style={{ padding: '12px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
        <Bell size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: '#00d4ff' }} />
        This page receives live notifications when admins broadcast announcements or crowd alerts. Ask an admin to send one to see it appear here instantly!
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>ALL CAUGHT UP</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            No notifications yet. Live updates will appear here instantly when broadcast.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => {
            const cfg  = TYPE_ICONS[n.type] || TYPE_ICONS.default;
            const Icon = cfg.icon;
            return (
              <div key={n.id} onClick={() => markRead(n.id)} style={{ cursor: 'pointer' }}
                className="card" style={{
                  padding: 18,
                  background: n.read ? 'var(--bg-card)' : `${cfg.color}06`,
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : `${cfg.color}25`}`,
                  cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: `${cfg.color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {n.live && <span style={{ padding: '2px 8px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 100, fontSize: 10, color: '#00ff87', fontWeight: 700 }}>LIVE</span>}
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{n.time}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
