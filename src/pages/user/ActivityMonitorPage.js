import React, { useEffect, useMemo, useState } from 'react';
import { activityAPI } from '../../api';
import { Activity, Flame, Footprints, Loader, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityMonitorPage() {
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, attendanceRes] = await Promise.all([
          activityAPI.getStats(),
          activityAPI.getAttendance({ days: 14 }),
        ]);

        setStats(statsRes.data.data);
        setAttendance(attendanceRes.data.data);
      } catch (err) {
        setError('Failed to load activity data.');
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, []);

  const chartData = useMemo(() => {
    const logs = attendance?.logs || [];
    const daily = new Map();

    logs.forEach((log) => {
      const key = new Date(log.checkIn).toISOString().split('T')[0];
      const current = daily.get(key) || { visits: 0, minutes: 0 };
      current.visits += 1;
      current.minutes += log.duration || 0;
      daily.set(key, current);
    });

    return Array.from(daily.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, value]) => ({
        day: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        minutes: value.minutes,
        visits: value.visits,
      }));
  }, [attendance]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
        <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b' }}>
        {error}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Steps Today',
      value: (stats?.steps || 0).toLocaleString(),
      goal: `${(stats?.stepsGoal || 10000).toLocaleString()} goal`,
      pct: Math.min(100, Math.round(((stats?.steps || 0) / (stats?.stepsGoal || 10000)) * 100)),
      color: 'var(--accent-blue)',
      icon: Footprints,
    },
    {
      label: 'Calories Burned',
      value: Math.round(stats?.caloriesBurned || 0).toString(),
      goal: 'Today',
      pct: Math.min(100, Math.round(((stats?.caloriesBurned || 0) / 700) * 100)),
      color: 'var(--accent-orange)',
      icon: Flame,
    },
    {
      label: 'Active Minutes',
      value: Math.round(stats?.activeMinutes || 0).toString(),
      goal: `${attendance?.avgDuration || 0} min avg`,
      pct: Math.min(100, Math.round(((stats?.activeMinutes || 0) / 90) * 100)),
      color: 'var(--accent-green)',
      icon: Activity,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">ACTIVITY <span style={{ color: 'var(--accent-blue)' }}>MONITOR</span></h1>
        <p className="page-subtitle">Daily movement and gym attendance from your account activity</p>
      </div>

      <div className="grid-3">
        {statCards.map(({ label, value, goal, pct, color, icon: Icon }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color, lineHeight: 1, marginTop: 4 }}>{pct}%</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{goal}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>Attendance Minutes Over The Last Week</div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="activityMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="minutes" stroke="var(--accent-blue)" fill="url(#activityMinutes)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Check in to the gym to build your attendance chart.</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card card-sm" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <CalendarDays size={18} color="var(--accent-blue)" />
            <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>Consistency Snapshot</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Current Streak', value: `${attendance?.streak || 0} days` },
              { label: 'Visits This Month', value: attendance?.visitsThisMonth || 0 },
              { label: 'Total Visits Tracked', value: attendance?.totalVisits || 0 },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-sm" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 6 }}>
            {attendance?.isCheckedIn ? 'You are currently checked in' : 'No active gym session'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {attendance?.isCheckedIn
              ? `Current session started at ${new Date(attendance.activeSession.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`
              : 'Your activity totals come from workout logs and attendance history, so they stay consistent even without wearable sync.'}
          </p>
        </div>
      </div>
    </div>
  );
}
