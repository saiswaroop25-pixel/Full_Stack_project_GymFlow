import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../api';
import { TrendingUp, Award, Dumbbell, Loader } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#00ff87','#00d4ff','#ffd166','#a78bfa','#ff6b35','#ff3b3b'];

export default function WorkoutAnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [weeks, setWeeks]   = useState(8);

  useEffect(() => { loadAnalytics(); }, [weeks]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await workoutAPI.getAnalytics({ weeks });
      setData(res.data);
    } catch {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
      <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--text-secondary)' }}>Loading analytics...</span>
    </div>
  );

  if (error) return <div style={{ padding: 16, background: 'rgba(255,59,59,0.1)', borderRadius: 8, color: '#ff3b3b' }}>{error}</div>;

  const { totalWorkouts, totalVolume, avgDuration, prs, muscleDistribution, volumeByWeek, strengthProgress } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">ANALYTICS</h1>
          <p className="page-subtitle">Your training performance overview</p>
        </div>
        <select value={weeks} onChange={e => setWeeks(parseInt(e.target.value))}
          style={{ padding: '8px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}>
          <option value={4}>Last 4 weeks</option>
          <option value={8}>Last 8 weeks</option>
          <option value={12}>Last 12 weeks</option>
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Workouts', value: totalWorkouts,                    icon: Dumbbell,   color: '#a78bfa' },
          { label: 'Total Volume',   value: `${(totalVolume/1000).toFixed(1)}t`, icon: TrendingUp, color: '#00ff87' },
          { label: 'Avg Duration',   value: `${avgDuration} min`,             icon: Award,      color: '#ffd166' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <Icon size={24} color={color} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Volume by week */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>WEEKLY VOLUME</div>
          {volumeByWeek?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeByWeek} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${v} kg`, 'Volume']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="volume" fill="#00ff87" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="Log workouts to see volume trends" />}
        </div>

        {/* Muscle distribution */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>MUSCLE FOCUS</div>
          {muscleDistribution?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={muscleDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {muscleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {muscleDistribution.map((m, i) => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{m.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{m.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState text="Log exercises with muscle groups to see distribution" />}
        </div>
      </div>

      {/* Strength progress */}
      {strengthProgress?.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>STRENGTH PROGRESS</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={strengthProgress} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="bench"    name="Bench Press" stroke="#00ff87" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="squat"    name="Squat"       stroke="#00d4ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="deadlift" name="Deadlift"    stroke="#ffd166" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* PRs */}
      {prs?.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>PERSONAL RECORDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {prs.slice(0, 8).map(pr => (
              <div key={pr.exercise} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid rgba(255,215,0,0.15)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{pr.exercise}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#ffd166' }}>{pr.weight}<span style={{ fontSize: 14, marginLeft: 4 }}>kg</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {new Date(pr.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalWorkouts === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Dumbbell size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>NO DATA YET</div>
          <div style={{ color: 'var(--text-secondary)' }}>Log some workouts to see your analytics here.</div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{text}</div>;
}
