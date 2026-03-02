import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const revenueData = [
  { month: 'Sep', rev: 185000 }, { month: 'Oct', rev: 198000 }, { month: 'Nov', rev: 210000 },
  { month: 'Dec', rev: 228000 }, { month: 'Jan', rev: 242000 }, { month: 'Feb', rev: 256000 },
];

const attendanceData = [
  { day: 'Mon', in: 142, out: 138 }, { day: 'Tue', in: 168, out: 155 },
  { day: 'Wed', in: 125, out: 122 }, { day: 'Thu', in: 180, out: 172 },
  { day: 'Fri', in: 195, out: 188 }, { day: 'Sat', in: 210, out: 202 }, { day: 'Sun', in: 88, out: 85 },
];

const peakHours = [5,8,14,22,28,45,62,78,88,92,95,85,68,55,50,58,72,88,94,85,62,42,28,15];

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN CONTROL CENTER</div>
          <h1 className="page-title">OPERATIONS <span style={{ color: 'var(--accent-orange)' }}>HUB</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live Data · Updated just now</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid-4">
        {[
          { label: 'Total Members', value: '2,847', delta: '+142 this month', up: true, icon: Users, color: 'var(--accent-blue)' },
          { label: 'Monthly Revenue', value: '₹2.56L', delta: '+5.8% vs last month', up: true, icon: DollarSign, color: 'var(--accent-green)' },
          { label: 'Avg Daily Attendance', value: '158', delta: '-12 vs last week', up: false, icon: Activity, color: 'var(--accent-orange)' },
          { label: 'Retention Rate', value: '87%', delta: '+2.1% vs last quarter', up: true, icon: TrendingUp, color: 'var(--accent-purple)' },
        ].map(({ label, value, delta, up, icon: Icon, color }) => (
          <div key={label} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: up ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {delta.split(' ')[0]}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue + Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Revenue Trend (6 Months)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${(v/1000).toFixed(1)}k`, 'Revenue']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="rev" stroke="var(--accent-green)" fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Weekly Attendance</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="in" name="Check-ins" fill="var(--accent-blue)" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Bar dataKey="out" name="Check-outs" fill="var(--accent-purple)" opacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24-hour heatmap */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Today's 24-Hour Occupancy Pattern</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
          {peakHours.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: `${v}%`,
                background: v < 50 ? 'var(--accent-green)' : v < 75 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                borderRadius: '3px 3px 0 0', opacity: 0.8, maxHeight: 80,
                minHeight: 4, transition: 'all 0.3s',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {['12A', '3A', '6A', '9A', '12P', '3P', '6P', '9P', '12A'].map(t => (
            <span key={t} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Quick alerts */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>⚠️ Action Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { msg: '12 members with expiring subscriptions in 7 days', color: 'var(--accent-orange)' },
              { msg: 'Treadmill #3 maintenance overdue by 2 days', color: 'var(--accent-red)' },
              { msg: 'Peak hour imminent — consider crowd alert broadcast', color: 'var(--accent-yellow)' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                <div style={{ width: 4, borderRadius: 100, background: a.color, flexShrink: 0 }} />
                {a.msg}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Today's Stats</div>
          {[
            { label: 'Check-ins Today', value: '195', color: 'var(--accent-green)' },
            { label: 'Active Right Now', value: '74', color: 'var(--accent-blue)' },
            { label: 'New Registrations', value: '8', color: 'var(--accent-purple)' },
            { label: 'Revenue Today', value: '₹12,400', color: 'var(--accent-orange)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
