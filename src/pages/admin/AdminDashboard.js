import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Users, DollarSign, TrendingUp, Activity, Loader } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await adminAPI.getDashboard();
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
      <Loader size={32} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b' }}>{error}</div>
  );

  const { stats, recentMembers, planDistribution, weeklyAttendance } = data;

  const statCards = [
    { label: 'Total Members',    value: stats.totalMembers.toLocaleString(),    icon: Users,       color: '#00d4ff', sub: `${stats.activeMembers} active` },
    { label: 'Monthly Revenue',  value: `₹${(stats.monthlyRevenue/100).toFixed(0)}`,  icon: DollarSign,  color: '#00ff87', sub: 'Estimated' },
    { label: 'Today\'s Checkins',value: stats.todayAttendance,                  icon: Activity,    color: '#ffd166', sub: 'Checked in today' },
    { label: 'Retention Rate',   value: `${stats.retentionRate}%`,              icon: TrendingUp,  color: '#a78bfa', sub: 'Active members' },
  ];

  const planColors = { BASIC: '#9090b0', PREMIUM: '#00ff87', STUDENT: '#ffd166', ANNUAL: '#00d4ff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN CONTROL CENTER</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>OPERATIONS <span style={{ color: '#ff6b35' }}>HUB</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#00ff87' }}>
          <div style={{ width: 8, height: 8, background: '#00ff87', borderRadius: '50%', animation: 'pulse-dot 2s infinite' }} />
          Live Data · Updated just now
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: `${color}08`, borderRadius: '0 0 0 70px' }} />
            <div style={{ width: 36, height: 36, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Weekly Attendance */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>WEEKLY ATTENDANCE</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="checkins" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>PLAN DISTRIBUTION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planDistribution.map(({ plan, count }) => {
              const pct = Math.round((count / stats.totalMembers) * 100);
              const color = planColors[plan] || '#9090b0';
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{plan}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} members · {pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Members */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>RECENT MEMBERS</div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentMembers.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                <td>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${planColors[m.plan]}15`, color: planColors[m.plan] }}>
                    {m.plan}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
