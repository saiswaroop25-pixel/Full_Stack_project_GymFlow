import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Flame, Dumbbell, TrendingUp, Clock, Zap, ArrowRight, ChevronRight } from 'lucide-react';

const weekData = [
  { day: 'Mon', cal: 2100, burned: 320 },
  { day: 'Tue', cal: 2400, burned: 480 },
  { day: 'Wed', cal: 1900, burned: 210 },
  { day: 'Thu', cal: 2600, burned: 550 },
  { day: 'Fri', cal: 2200, burned: 390 },
  { day: 'Sat', cal: 2800, burned: 620 },
  { day: 'Sun', cal: 2050, burned: 0 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function UserDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [crowd, setCrowd] = useState(62);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
      setCrowd(v => Math.max(20, Math.min(95, v + (Math.random() - 0.5) * 8)));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const crowdColor = crowd < 50 ? 'var(--accent-green)' : crowd < 75 ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const crowdLabel = crowd < 50 ? 'Low' : crowd < 75 ? 'Moderate' : 'Peak';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      {/* Header */}
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
            {time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="page-title">GOOD {time.getHours() < 12 ? 'MORNING' : time.getHours() < 17 ? 'AFTERNOON' : 'EVENING'},<br />
            <span style={{ color: 'var(--accent-green)' }}>{user.name.split(' ')[0].toUpperCase()}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid-4">
        {[
          { label: 'Crowd Level', value: `${Math.round(crowd)}%`, sub: crowdLabel, icon: Users, color: crowdColor, action: () => navigate('/app/crowd') },
          { label: 'Cal Consumed', value: '2,140', sub: '/ 2,500 goal', icon: Flame, color: 'var(--accent-orange)' },
          { label: 'Workout Streak', value: '8 days', sub: 'Personal best!', icon: Dumbbell, color: 'var(--accent-purple)' },
          { label: 'Steps Today', value: '7,832', sub: '/ 10,000 goal', icon: TrendingUp, color: 'var(--accent-blue)' },
        ].map(({ label, value, sub, icon: Icon, color, action }) => (
          <div key={label} className="card" onClick={action} style={{ cursor: action ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${color}08`, borderRadius: '0 0 0 80px' }} />
            <div style={{ width: 40, height: 40, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sub}</div>
            {action && <ChevronRight size={14} style={{ position: 'absolute', bottom: 16, right: 16, color: 'var(--text-muted)' }} />}
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Weekly calorie chart */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="section-title">Weekly Overview</div>
            <span className="badge badge-blue">Cal & Burn</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cal" name="Calories" stroke="var(--accent-blue)" fill="url(#calGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="burned" name="Burned" stroke="var(--accent-orange)" fill="url(#burnGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 2, background: 'var(--accent-blue)', borderRadius: 1 }} /> Consumed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 2, background: 'var(--accent-orange)', borderRadius: 1 }} /> Burned
            </div>
          </div>
        </div>

        {/* Today's recommended slot */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-elevated))' }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Best Time to Visit Today</div>
          {[
            { time: '6:00 AM', crowd: 28, label: 'Early Bird', color: 'var(--accent-green)' },
            { time: '12:00 PM', crowd: 45, label: 'Lunch Break', color: 'var(--accent-green)' },
            { time: '6:00 PM', crowd: 87, label: 'Peak Hour', color: 'var(--accent-red)' },
            { time: '9:00 PM', crowd: 38, label: 'Evening Calm', color: 'var(--accent-green)' },
          ].map(({ time: t, crowd: c, label, color }) => (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ width: 70, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{t}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${c}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.5s' }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color, fontWeight: 700, width: 36, textAlign: 'right' }}>{c}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>{label}</div>
            </div>
          ))}
          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => navigate('/app/slots')}>
            Book a Slot <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Today's workout */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="section-title">Today's Workout</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/workout')}>Log Workout</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Bench Press', sets: '4×8', weight: '80kg', done: true, muscle: 'Chest' },
              { name: 'Incline Dumbbell Press', sets: '3×10', weight: '24kg', done: true, muscle: 'Chest' },
              { name: 'Cable Flyes', sets: '3×12', weight: '15kg', done: false, muscle: 'Chest' },
              { name: 'Tricep Pushdowns', sets: '4×12', weight: '20kg', done: false, muscle: 'Triceps' },
            ].map(ex => (
              <div key={ex.name} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                border: `1px solid ${ex.done ? 'rgba(0,255,135,0.2)' : 'var(--border)'}`,
                opacity: ex.done ? 0.7 : 1,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: ex.done ? 'var(--accent-green)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${ex.done ? 'var(--accent-green)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}>
                  {ex.done && <span style={{ color: '#000', fontSize: 14, fontWeight: 800 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, textDecoration: ex.done ? 'line-through' : 'none', color: ex.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ex.muscle}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ex.sets}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ex.weight}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Quick Access</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Log Meal', icon: Flame, path: '/app/diet', color: 'var(--accent-orange)' },
              { label: 'Check Crowd', icon: Users, path: '/app/crowd', color: 'var(--accent-green)' },
              { label: 'View Progress', icon: TrendingUp, path: '/app/analytics', color: 'var(--accent-blue)' },
              { label: 'Book Slot', icon: Clock, path: '/app/slots', color: 'var(--accent-purple)' },
              { label: 'Set Goal', icon: Zap, path: '/app/goals', color: 'var(--accent-yellow)' },
            ].map(({ label, icon: Icon, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                <div style={{ width: 32, height: 32, background: `${color}15`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
