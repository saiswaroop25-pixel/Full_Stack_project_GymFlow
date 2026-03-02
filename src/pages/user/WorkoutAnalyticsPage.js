import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Award, Zap, BarChart3 } from 'lucide-react';

const strengthData = [
  { week: 'W1', bench: 70, squat: 90, deadlift: 110 },
  { week: 'W2', bench: 72, squat: 95, deadlift: 115 },
  { week: 'W3', bench: 75, squat: 95, deadlift: 120 },
  { week: 'W4', bench: 77, squat: 100, deadlift: 125 },
  { week: 'W5', bench: 77, squat: 105, deadlift: 130 },
  { week: 'W6', bench: 80, squat: 107, deadlift: 132 },
  { week: 'W7', bench: 82, squat: 110, deadlift: 135 },
  { week: 'W8', bench: 82, squat: 112, deadlift: 140 },
];

const volumeData = [
  { day: 'Mon', vol: 8200 }, { day: 'Tue', vol: 9400 }, { day: 'Wed', vol: 0 },
  { day: 'Thu', vol: 11200 }, { day: 'Fri', vol: 9800 }, { day: 'Sat', vol: 13400 }, { day: 'Sun', vol: 0 },
];

const muscleData = [
  { muscle: 'Chest', value: 85 }, { muscle: 'Back', value: 78 },
  { muscle: 'Legs', value: 92 }, { muscle: 'Shoulders', value: 65 },
  { muscle: 'Arms', value: 70 }, { muscle: 'Core', value: 55 },
];

const pieMuscle = [
  { name: 'Chest', value: 22, color: 'var(--accent-blue)' },
  { name: 'Back', value: 20, color: 'var(--accent-green)' },
  { name: 'Legs', value: 25, color: 'var(--accent-purple)' },
  { name: 'Shoulders', value: 15, color: 'var(--accent-orange)' },
  { name: 'Arms', value: 12, color: 'var(--accent-yellow)' },
  { name: 'Core', value: 6, color: 'var(--accent-red)' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
        {payload.map(p => <div key={p.name} style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>{p.name}: {p.value}{p.name === 'Volume' ? ' kg' : ' kg'}</div>)}
      </div>
    );
  }
  return null;
};

export default function WorkoutAnalyticsPage() {
  const [period, setPeriod] = useState('8W');

  const prs = [
    { lift: 'Bench Press', weight: '82 kg', date: 'Feb 20', prev: '80 kg', delta: '+2 kg' },
    { lift: 'Squat', weight: '112 kg', date: 'Feb 22', prev: '107 kg', delta: '+5 kg' },
    { lift: 'Deadlift', weight: '140 kg', date: 'Feb 25', prev: '135 kg', delta: '+5 kg' },
    { lift: 'OHP', weight: '60 kg', date: 'Feb 18', prev: '57.5 kg', delta: '+2.5 kg' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">WORKOUT <span style={{ color: 'var(--accent-blue)' }}>ANALYTICS</span></h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Your performance data, visualized.</p>
        </div>
        <div className="tabs" style={{ width: 'auto' }}>
          {['4W', '8W', '3M', '6M', '1Y'].map(p => (
            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)} style={{ flex: 'none', padding: '6px 12px' }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4">
        {[
          { label: 'Total Volume', value: '52,400 kg', sub: '+12% vs last period', icon: BarChart3, color: 'var(--accent-blue)' },
          { label: 'Workouts Done', value: '14', sub: '2x / week avg', icon: Zap, color: 'var(--accent-green)' },
          { label: 'PRs Set', value: '4', sub: 'This period', icon: Award, color: 'var(--accent-yellow)' },
          { label: 'Avg Session', value: '61 min', sub: '+4 min vs last', icon: TrendingUp, color: 'var(--accent-purple)' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card">
            <div style={{ width: 40, height: 40, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Strength progression */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div className="section-title">Strength Progression</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ label: 'Bench', color: 'var(--accent-blue)' }, { label: 'Squat', color: 'var(--accent-green)' }, { label: 'Deadlift', color: 'var(--accent-orange)' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ width: 24, height: 2, background: l.color, borderRadius: 1 }} /> {l.label}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={strengthData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit=" kg" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="bench" name="Bench" stroke="var(--accent-blue)" strokeWidth={2.5} dot={{ fill: 'var(--accent-blue)', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="squat" name="Squat" stroke="var(--accent-green)" strokeWidth={2.5} dot={{ fill: 'var(--accent-green)', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="deadlift" name="Deadlift" stroke="var(--accent-orange)" strokeWidth={2.5} dot={{ fill: 'var(--accent-orange)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Weekly volume bars */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Weekly Volume</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volumeData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Bar dataKey="vol" name="Volume" radius={[4, 4, 0, 0]} fill="var(--accent-purple)" opacity={0.8}>
                {volumeData.map((entry, i) => (
                  <Cell key={i} fill={entry.vol > 0 ? 'var(--accent-purple)' : 'var(--bg-elevated)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Muscle distribution pie */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Muscle Focus</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieMuscle} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {pieMuscle.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {pieMuscle.map(({ name, value, color }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRs */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Recent PRs 🏆</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prs.map(pr => (
              <div key={pr.lift} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{pr.lift}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pr.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent-yellow)' }}>{pr.weight}</div>
                  <div style={{ fontSize: 11, color: 'var(--accent-green)' }}>{pr.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Muscle radar */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Muscle Balance Score</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
          <ResponsiveContainer width={300} height={250}>
            <RadarChart data={muscleData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Radar name="Score" dataKey="value" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              Your muscle development shows strong leg and chest engagement, but <span style={{ color: 'var(--accent-yellow)' }}>core and shoulder work could improve</span> for better overall balance and injury prevention.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {muscleData.map(({ muscle, value }) => (
                <div key={muscle}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{muscle}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: value > 80 ? 'var(--accent-green)' : value > 60 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>{value}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 100 }}>
                    <div style={{ width: `${value}%`, height: '100%', background: value > 80 ? 'var(--accent-green)' : value > 60 ? 'var(--accent-yellow)' : 'var(--accent-red)', borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
