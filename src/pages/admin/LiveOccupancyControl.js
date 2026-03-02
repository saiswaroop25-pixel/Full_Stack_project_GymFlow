import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Radio, AlertTriangle, Users, Sliders, Bell, CheckCircle } from 'lucide-react';

const zones = [
  { name: 'Free Weights', current: 85, capacity: 40, status: 'high' },
  { name: 'Cardio Floor', current: 60, capacity: 30, status: 'moderate' },
  { name: 'Machines Area', current: 45, capacity: 25, status: 'low' },
  { name: 'Stretching Zone', current: 20, capacity: 15, status: 'low' },
  { name: 'Group Classes', current: 70, capacity: 20, status: 'moderate' },
  { name: 'Swimming Pool', current: 55, capacity: 20, status: 'moderate' },
];

const hourlyForecast = [
  { hour: '3PM', crowd: 62 }, { hour: '4PM', crowd: 75 }, { hour: '5PM', crowd: 88 },
  { hour: '6PM', crowd: 96 }, { hour: '7PM', crowd: 82 }, { hour: '8PM', crowd: 58 },
  { hour: '9PM', crowd: 34 },
];

export default function LiveOccupancyControl() {
  const [totalCrowd, setTotalCrowd] = useState(67);
  const [override, setOverride] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [zoneData, setZoneData] = useState(zones);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalCrowd(v => Math.max(20, Math.min(98, v + (Math.random() - 0.5) * 5)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const crowdColor = totalCrowd < 50 ? 'var(--accent-green)' : totalCrowd < 75 ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const crowdLabel = totalCrowd < 50 ? 'LOW' : totalCrowd < 75 ? 'MODERATE' : 'PEAK';

  const sendAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const applyOverride = (level) => {
    setOverride(level);
    setTimeout(() => setOverride(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · OCCUPANCY</div>
          <h1 className="page-title">LIVE <span style={{ color: 'var(--accent-orange)' }}>OCCUPANCY</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Real-Time · Auto Refreshing</span>
        </div>
      </div>

      {/* Main crowd ring + controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Big ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${crowdColor}08, transparent 70%)` }} />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="live-dot" style={{ width: 6, height: 6 }} /> Current Gym Occupancy
          </div>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="110" cy="110" r="90" fill="none" stroke="var(--bg-elevated)" strokeWidth="16" />
              <circle cx="110" cy="110" r="90" fill="none" stroke={crowdColor} strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - (override !== null ? override : totalCrowd) / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${crowdColor})` }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 58, color: crowdColor, lineHeight: 1, transition: 'color 0.5s' }}>
                {Math.round(override !== null ? override : totalCrowd)}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: crowdColor, letterSpacing: '0.1em', marginTop: 4 }}>{crowdLabel}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>134 / 200 members</div>
            </div>
          </div>
          {override !== null && (
            <div style={{ marginTop: 16, background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={12} /> Manual override active
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Manual Override */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={16} color="var(--accent-yellow)" /> Manual Override
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ label: 'SET LOW', value: 30, color: 'var(--accent-green)' }, { label: 'SET MED', value: 60, color: 'var(--accent-yellow)' }, { label: 'SET HIGH', value: 85, color: 'var(--accent-red)' }].map(o => (
                <button key={o.label} onClick={() => applyOverride(o.value)}
                  style={{ padding: '10px 8px', background: `${o.color}15`, border: `1px solid ${o.color}40`, borderRadius: 8, color: o.color, fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${o.color}25`}
                  onMouseLeave={e => e.currentTarget.style.background = `${o.color}15`}
                >{o.label}</button>
              ))}
            </div>
          </div>

          {/* Broadcast Alert */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="var(--accent-red)" /> Crowd Alert Broadcast
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Gym is filling up fast — book your slot now!', 'Peak hour ahead at 6PM. Visit before 5PM for open space.', 'Free weights zone is 85% full — try machines area.'].map((msg, i) => (
                <button key={i} onClick={sendAlert}
                  style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Radio size={12} /> {msg}
                </button>
              ))}
            </div>
            {alertSent && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-green)' }}>
                <CheckCircle size={14} /> Alert broadcast to all 134 active members!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone breakdown */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>Zone-by-Zone Occupancy</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {zoneData.map(z => {
            const color = z.current < 50 ? 'var(--accent-green)' : z.current < 75 ? 'var(--accent-yellow)' : 'var(--accent-red)';
            return (
              <div key={z.name} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: `1px solid ${color}25` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{z.name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color }}>{z.current}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${z.current}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.6s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Capacity: {z.capacity} people</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>Crowd Forecast — Next 6 Hours</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={hourlyForecast} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}%`, 'Expected Crowd']} />
            <Bar dataKey="crowd" radius={[4, 4, 0, 0]}>
              {hourlyForecast.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.crowd < 50 ? '#00ff87' : entry.crowd < 75 ? '#ffd166' : '#ff3b3b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}