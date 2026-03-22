import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { crowdAPI, adminAPI } from '../../api';
import { Wifi, WifiOff, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SOCKET_URL = 'http://localhost:5000';

export default function LiveOccupancyControl() {
  const [crowd, setCrowd]         = useState({ checkedIn: 0, capacity: 200, crowdPct: 0, crowdLevel: 'LOW' });
  const [hourly, setHourly]       = useState([]);
  const [connected, setConnected] = useState(false);
  const [override, setOverride]   = useState('');
  const [overriding, setOverriding] = useState(false);
  const [success, setSuccess]     = useState('');
  const [alertMsg, setAlertMsg]   = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cur, hr] = await Promise.all([crowdAPI.getCurrent(), crowdAPI.getHourly()]);
        setCrowd(cur.data.data);
        setHourly(hr.data.data || []);
      } catch { }
    };
    load();

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('connect',      () => setConnected(true));
    socket.on('disconnect',   () => setConnected(false));
    socket.on('crowd:update', (data) => setCrowd(data));
    return () => socket.disconnect();
  }, []);

  const handleOverride = async () => {
    const pct = parseInt(override);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    setOverriding(true);
    try {
      await crowdAPI.checkIn(); // uses admin override endpoint via REST
      // Direct override via API
      const response = await fetch('http://localhost:5000/api/crowd/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('gymflow_token')}` },
        body: JSON.stringify({ crowdPct: pct }),
      });
      const data = await response.json();
      setCrowd(data.data);
      setSuccess(`Crowd set to ${pct}% and broadcast to all clients!`);
      setOverride('');
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setOverriding(false); }
  };

  const handleBroadcast = async () => {
    if (!alertMsg.trim()) return;
    setBroadcasting(true);
    try {
      await fetch('http://localhost:5000/api/crowd/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('gymflow_token')}` },
        body: JSON.stringify({ message: alertMsg, type: 'alert' }),
      });
      setSuccess('Alert broadcast to all connected users!');
      setAlertMsg('');
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setBroadcasting(false); }
  };

  const pct   = crowd.crowdPct || 0;
  const color = pct < 40 ? '#00ff87' : pct < 70 ? '#ffd166' : '#ff3b3b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">LIVE OCCUPANCY</h1>
          <p className="page-subtitle">Real-time crowd control center</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: connected ? 'rgba(0,255,135,0.1)' : 'rgba(255,59,59,0.1)', borderRadius: 100, border: `1px solid ${connected ? 'rgba(0,255,135,0.3)' : 'rgba(255,59,59,0.3)'}` }}>
          {connected ? <Wifi size={14} color="#00ff87" /> : <WifiOff size={14} color="#ff3b3b" />}
          <span style={{ fontSize: 12, fontWeight: 700, color: connected ? '#00ff87' : '#ff3b3b' }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Live ring */}
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 20px' }}>
            <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="90" cy="90" r="75" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
              <circle cx="90" cy="90" r="75" fill="none" stroke={color} strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 75}`}
                strokeDashoffset={`${2 * Math.PI * 75 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>CAPACITY</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color }}>{crowd.checkedIn}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Checked In</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{crowd.capacity - crowd.checkedIn}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Available</div>
            </div>
          </div>
        </div>

        {/* Admin controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 14 }}>OVERRIDE CROWD %</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={override} onChange={e => setOverride(e.target.value)} placeholder="0–100" min="0" max="100"
                style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handleOverride} disabled={overriding || !override}>
                {overriding ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Set'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Broadcasts instantly to all connected clients</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 14 }}>BROADCAST ALERT</div>
            <textarea value={alertMsg} onChange={e => setAlertMsg(e.target.value)} placeholder="e.g. Gym closing in 30 minutes..." rows={3}
              style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 14, width: '100%', resize: 'none' }} />
            <button className="btn btn-danger" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={handleBroadcast} disabled={broadcasting || !alertMsg.trim()}>
              {broadcasting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '📢 Broadcast to All Members'}
            </button>
          </div>
        </div>
      </div>

      {/* Hourly chart */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>TODAY — HOURLY TRAFFIC</div>
        {hourly.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff6b35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip formatter={v => [`${v}%`, 'Occupancy']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="crowd" stroke="#ff6b35" fill="url(#occGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hourly data recorded yet today</div>
        )}
      </div>
    </div>
  );
}
