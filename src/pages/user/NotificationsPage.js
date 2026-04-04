import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { activityAPI } from '../../api';
import { SOCKET_URL } from '../../config';
import { Bell, Users, Dumbbell, Megaphone, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const READ_STORAGE_KEY = 'gymflow-notification-read-ids';

const TYPE_ICONS = {
  crowd: { icon: Users, color: '#00ff87' },
  slot: { icon: CheckCircle, color: '#00d4ff' },
  workout: { icon: Dumbbell, color: '#a78bfa' },
  alert: { icon: AlertTriangle, color: '#ff3b3b' },
  offer: { icon: Megaphone, color: '#ffd166' },
  update: { icon: Bell, color: '#00d4ff' },
  maintenance: { icon: AlertTriangle, color: '#ffd166' },
  default: { icon: Bell, color: '#9090b0' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => loadReadIds());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await activityAPI.getNotifications();
        if (!mounted) return;
        setNotifications(normalizeServerNotifications(data.data || []));
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load notifications.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('announcement', (data) => {
      setNotifications((current) =>
        mergeNotifications(current, [
          {
            id: data.id ? `announcement:${data.id}` : `announcement:live:${Date.now()}`,
            type: data.type || 'update',
            title: data.title,
            body: data.message,
            createdAt: data.timestamp || new Date().toISOString(),
            live: true,
          },
        ])
      );
    });

    socket.on('crowd:alert', (data) => {
      setNotifications((current) =>
        mergeNotifications(current, [
          {
            id: `crowd-alert:${data.timestamp || Date.now()}`,
            type: 'alert',
            title: 'Crowd Alert',
            body: data.message,
            createdAt: data.timestamp || new Date().toISOString(),
            live: true,
          },
        ])
      );
    });

    return () => socket.disconnect();
  }, []);

  const unread = useMemo(
    () => notifications.filter((notification) => !readIds.has(notification.id)).length,
    [notifications, readIds]
  );

  const markRead = (id) => {
    const next = new Set(readIds);
    next.add(id);
    persistReadIds(next);
    setReadIds(next);
  };

  const markAllRead = () => {
    const next = new Set(readIds);
    notifications.forEach((notification) => next.add(notification.id));
    persistReadIds(next);
    setReadIds(next);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">NOTIFICATIONS</h1>
          <p className="page-subtitle">
            Real updates from announcements, bookings, workouts, and crowd status ·{' '}
            <span style={{ color: connected ? '#00ff87' : '#ff3b3b', fontWeight: 600 }}>
              {connected ? '● Connected' : '● Disconnected'}
            </span>
          </p>
          {unread > 0 && (
            <span className="badge badge-orange" style={{ marginTop: 8 }}>
              {unread} unread
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}
      >
        <Bell size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: '#00d4ff' }} />
        This feed loads saved activity from the API and keeps listening for live admin announcements and crowd alerts.
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(255,59,59,0.1)',
            border: '1px solid rgba(255,59,59,0.3)',
            borderRadius: 8,
            color: '#ff3b3b',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader size={32} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12 }}>Loading notifications...</div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>ALL CAUGHT UP</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            No notifications yet. New workouts, bookings, crowd alerts, and announcements will show up here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((notification) => {
            const config = TYPE_ICONS[notification.type] || TYPE_ICONS.default;
            const Icon = config.icon;
            const isRead = readIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className="card"
                onClick={() => markRead(notification.id)}
                style={{
                  padding: 18,
                  background: isRead ? 'var(--bg-card)' : `${config.color}06`,
                  border: `1px solid ${isRead ? 'var(--border-subtle)' : `${config.color}25`}`,
                  cursor: 'pointer',
                  opacity: isRead ? 0.8 : 1,
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: `${config.color}15`,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={config.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{notification.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {notification.live && (
                          <span
                            style={{
                              padding: '2px 8px',
                              background: 'rgba(0,255,135,0.1)',
                              border: '1px solid rgba(0,255,135,0.3)',
                              borderRadius: 100,
                              fontSize: 10,
                              color: '#00ff87',
                              fontWeight: 700,
                            }}
                          >
                            LIVE
                          </span>
                        )}
                        {!isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color }} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                      {notification.body}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      {formatRelativeTime(notification.createdAt)}
                    </div>
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

function normalizeServerNotifications(items) {
  return items.map((item) => ({
    id: item.id,
    type: item.type || 'update',
    title: item.title,
    body: item.body,
    createdAt: item.createdAt,
    live: false,
  }));
}

function mergeNotifications(current, incoming) {
  const map = new Map(current.map((item) => [item.id, item]));

  incoming.forEach((item) => {
    map.set(item.id, { ...map.get(item.id), ...item });
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function loadReadIds() {
  try {
    const value = window.localStorage.getItem(READ_STORAGE_KEY);
    return new Set(value ? JSON.parse(value) : []);
  } catch {
    return new Set();
  }
}

function persistReadIds(readIds) {
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  } catch {
    // Ignore storage issues and keep the feed usable.
  }
}

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
