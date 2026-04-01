import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { crowdAPI } from '../../api';
import { SOCKET_URL } from '../../config';
import { Users, TrendingUp, Clock, Wifi, WifiOff } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LiveCrowdPage() {
  const [crowd, setCrowd]       = useState({ checkedIn: 0, capacity: 200, crowdPct: 0, crowdLevel: 'LOW' });
  const [hourly, setHourly]     = useState([]);
  const [weekly, setWeekly]     = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading]   = useState(true);

  // Load initial data from REST API
  useEffect(() => {
    const load = async () => {
      try {
        const [cur, hr, wk] = await Promise.all([
          crowdAPI.getCurrent(),
          crowdAPI.getHourly(),
          crowdAPI.getWeekly(),
        ]);
        setCrowd(cur.data.data);
        setHourly(hr.data.data || []);
        setWeekly(wk.data.data || []);
      } catch (err) {
        console.error('Failed to load crowd data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Connect Socket.IO for live updates
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect',       () => setConnected(true));
    socket.on('disconnect',    () => setConnected(false));
    socket.on('crowd:update',  (data) => setCrowd(data));

    return () => socket.disconnect();
  }, []);

  const pct        = crowd.crowdPct || 0;
  const crowdColor = pct < 40 ? '#00ff87' : pct < 70 ? '#ffd166' : '#ff3b3b';
  const crowdLabel = pct < 40 ? 'Low — Great time to visit!' : pct < 70 ? 'Moderate — Expect some wait' : 'Peak — Very Busy';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-secondary)' }}>
        Loading live crowd data...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">LIVE CROWD</h1>
          <p className="page-subtitle">Real-time gym occupancy · Updates every 30s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: connected ? 'rgba(0,255,135,0.1)' : 'rgba(255,59,59,0.1)', borderRadius: 100, border: `1px solid ${connected ? 'rgba(0,255,135,0.3)' : 'rgba(255,59,59,0.3)'}` }}>
          {connected ? <Wifi size={14} color="#00ff87" /> : <WifiOff size={14} color="#ff3b3b" />}
          <span style={{ fontSize: 12, fontWeight: 700, color: connected ? '#00ff87' : '#ff3b3b' }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Main crowd ring */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${crowdColor}08, transparent 60%)` }} />

        {/* Ring */}
        <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 24px' }}>
          <svg viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="110" cy="110" r="90" fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
            <circle cx="110" cy="110" r="90" fill="none" stroke={crowdColor} strokeWidth="14"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: crowdColor, lineHeight: 1, transition: 'color 0.5s' }}>
              {pct}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>CAPACITY</div>
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, color: crowdColor, marginBottom: 8 }}>{crowd.crowdLevel}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{crowdLabel}</div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: Users,      label: 'Checked In',  value: crowd.checkedIn },
            { icon: TrendingUp, label: 'Capacity',     value: crowd.capacity },
            { icon: Clock,      label: 'Available',    value: crowd.capacity - crowd.checkedIn },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12 }}>
              <Icon size={18} color="var(--text-secondary)" style={{ marginBottom: 8 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Hourly */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Today — Hourly Crowd</div>
          {hourly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff87" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Crowd']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="crowd" stroke="#00ff87" fill="url(#crowdGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No data yet for today
            </div>
          )}
        </div>

        {/* Weekly */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Weekly Average</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly.length > 0 ? weekly : defaultWeekly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, 'Avg Crowd']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {(weekly.length > 0 ? weekly : defaultWeekly).map((entry, i) => (
                  <Cell key={i} fill={entry.avg < 40 ? '#00ff87' : entry.avg < 70 ? '#ffd166' : '#ff3b3b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Fallback data if DB has no weekly snapshots yet
const defaultWeekly = [
  { day: 'Mon', avg: 62 }, { day: 'Tue', avg: 55 }, { day: 'Wed', avg: 70 },
  { day: 'Thu', avg: 48 }, { day: 'Fri', avg: 80 }, { day: 'Sat', avg: 90 }, { day: 'Sun', avg: 40 },
];
