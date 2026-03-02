import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, TrendingDown, Zap, AlertCircle } from 'lucide-react';

const hourlyData = [
  { h: '5AM', v: 12 }, { h: '6AM', v: 28 }, { h: '7AM', v: 52 }, { h: '8AM', v: 78 },
  { h: '9AM', v: 65 }, { h: '10AM', v: 45 }, { h: '11AM', v: 38 }, { h: '12PM', v: 55 },
  { h: '1PM', v: 62 }, { h: '2PM', v: 41 }, { h: '3PM', v: 33 }, { h: '4PM', v: 48 },
  { h: '5PM', v: 72 }, { h: '6PM', v: 88 }, { h: '7PM', v: 95 }, { h: '8PM', v: 82 },
  { h: '9PM', v: 58 }, { h: '10PM', v: 31 },
];

const weekHeatmap = {
  Mon: [15, 30, 45, 65, 50, 35, 25, 40, 55, 70, 90, 85, 60, 30],
  Tue: [10, 25, 50, 70, 55, 30, 20, 35, 60, 75, 88, 80, 55, 25],
  Wed: [12, 28, 48, 68, 52, 32, 22, 38, 58, 72, 85, 78, 52, 22],
  Thu: [18, 35, 55, 72, 58, 40, 28, 45, 62, 78, 92, 87, 65, 35],
  Fri: [20, 40, 60, 75, 62, 45, 32, 50, 65, 80, 95, 90, 70, 40],
  Sat: [8, 18, 35, 52, 40, 25, 18, 30, 45, 60, 72, 68, 50, 20],
  Sun: [5, 12, 22, 35, 28, 18, 12, 22, 35, 48, 58, 52, 38, 15],
};

const getColor = (v) => {
  if (v < 40) return 'var(--accent-green)';
  if (v < 70) return 'var(--accent-yellow)';
  return 'var(--accent-red)';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const v = payload[0].value;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: getColor(v), fontWeight: 700 }}>{v}% occupied</div>
      </div>
    );
  }
  return null;
};

export default function LiveCrowdPage() {
  const [crowd, setCrowd] = useState(62);
  const [history, setHistory] = useState([62, 65, 60, 68, 63]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => {
      const newVal = Math.max(15, Math.min(98, crowd + (Math.random() - 0.48) * 10));
      setCrowd(Math.round(newVal));
      setHistory(h => [...h.slice(-19), Math.round(newVal)]);
      setLastUpdate(new Date());
    }, 2000);
    return () => clearInterval(t);
  }, [crowd]);

  const crowdColor = getColor(crowd);
  const crowdLabel = crowd < 40 ? 'LOW' : crowd < 70 ? 'MODERATE' : 'PEAK';
  const circumference = 2 * Math.PI * 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="page-title">LIVE <span style={{ color: 'var(--accent-green)' }}>CROWD</span></h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Updated {lastUpdate.toLocaleTimeString()} · Gold's Gym, Koramangala
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ l: 'LOW', c: 'var(--accent-green)' }, { l: 'MED', c: 'var(--accent-yellow)' }, { l: 'HIGH', c: 'var(--accent-red)' }].map(s => (
            <span key={s.l} style={{ padding: '4px 10px', borderRadius: 100, background: `${s.c}15`, border: `1px solid ${s.c}40`, fontSize: 11, color: s.c, fontWeight: 800 }}>{s.l}</span>
          ))}
        </div>
      </div>

      {/* Main crowd display + zone breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24 }}>
        {/* Giant meter */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, position: 'relative', overflow: 'hidden', minWidth: 300 }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${crowdColor}08, transparent 70%)`, transition: 'background 0.5s' }} />
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg viewBox="0 0 220 220" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r="90" fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
              <circle cx="110" cy="110" r="90" fill="none" stroke={crowdColor} strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - crowd / 100)}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease', filter: `drop-shadow(0 0 12px ${crowdColor}80)` }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, lineHeight: 1, color: crowdColor, transition: 'color 0.5s', filter: `drop-shadow(0 0 20px ${crowdColor}60)` }}>
                {crowd}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 700 }}>% CAPACITY</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.15em', color: crowdColor }}>{crowdLabel}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>People Inside</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>~{Math.round(crowd * 2.4)} / 240</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Entry Rate</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 600 }}>+4/min</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Trend</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent-orange)', fontWeight: 600 }}>
                <TrendingDown size={14} /> Decreasing
              </span>
            </div>
          </div>

          {crowd > 75 && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 8, alignItems: 'flex-start', width: '100%' }}>
              <AlertCircle size={16} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--accent-red)', lineHeight: 1.5 }}>Peak hour detected. Consider visiting after 8 PM for a quieter session.</span>
            </div>
          )}
        </div>

        {/* Zone breakdown + live history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Zone cards */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Zone Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { zone: 'Weights Floor', pct: 82, capacity: '50 people' },
                { zone: 'Cardio Zone', pct: 55, capacity: '30 people' },
                { zone: 'Functional Area', pct: 40, capacity: '20 people' },
                { zone: 'Locker Room', pct: 65, capacity: '40 people' },
                { zone: 'Yoga Studio', pct: 20, capacity: '15 people' },
                { zone: 'Pool Area', pct: 35, capacity: '25 people' },
              ].map(({ zone, pct, capacity }) => {
                const c = getColor(pct);
                return (
                  <div key={zone} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, border: `1px solid ${c}20` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{zone}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: c }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 100 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 100, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Max: {capacity}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live 60s chart */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="section-title">Live Pulse <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>(last 20 readings)</span></div>
              <div className="live-dot" />
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={history.map((v, i) => ({ i, v }))} margin={{ top: 0, right: 0, bottom: 0, left: -40 }}>
                <defs>
                  <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={crowdColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={crowdColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={crowdColor} fill="url(#liveGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly trend + heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Hourly */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Today's Hourly Pattern</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, idx) => (
                  <Cell key={idx} fill={getColor(entry.v)} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly heatmap */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Weekly Heatmap</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingTop: 4, paddingBottom: 4 }}>
              {Object.keys(weekHeatmap).map(day => (
                <div key={day} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, lineHeight: '1', height: 20, display: 'flex', alignItems: 'center' }}>{day}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.values(weekHeatmap).map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 4 }}>
                  {row.map((v, ci) => (
                    <div key={ci} title={`${v}%`} style={{
                      flex: 1, height: 20, borderRadius: 3,
                      background: getColor(v),
                      opacity: 0.2 + (v / 100) * 0.8,
                      transition: 'opacity 0.2s',
                      cursor: 'default',
                    }} />
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {['5A', '7A', '9A', '11A', '1P', '3P', '5P', '7P', '9P', '10P', '', '', '', ''].map((t, i) => (
                  <div key={i} style={{ flex: 1, fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', overflow: 'hidden' }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
            {['var(--accent-green)', 'var(--accent-yellow)', 'var(--accent-orange)', 'var(--accent-red)'].map((c, i) => (
              <div key={i} style={{ width: 14, height: 14, background: c, borderRadius: 3, opacity: 0.3 + i * 0.23 }} />
            ))}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
          </div>
        </div>
      </div>

      {/* Smart recommendation */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.08), transparent)', border: '1px solid rgba(0,255,135,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: 'var(--accent-green-dim)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={24} color="var(--accent-green)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-green)', marginBottom: 4 }}>AI RECOMMENDATION</div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              Based on current crowd levels and your workout history, the <strong>best time to visit today is 9:00 PM</strong> — crowd is expected to drop to ~35%. You can have the weights floor mostly to yourself.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            <Users size={14} /> Book 9 PM
          </button>
        </div>
      </div>
    </div>
  );
}
