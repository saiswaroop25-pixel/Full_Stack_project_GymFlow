import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

const attendanceData = [
  { week: 'W1', checkins: 842, unique: 612 }, { week: 'W2', checkins: 978, unique: 698 },
  { week: 'W3', checkins: 901, unique: 654 }, { week: 'W4', checkins: 1102, unique: 788 },
  { week: 'W5', checkins: 1024, unique: 742 }, { week: 'W6', checkins: 1156, unique: 810 },
  { week: 'W7', checkins: 1089, unique: 772 }, { week: 'W8', checkins: 1248, unique: 884 },
];

const retentionData = [
  { month: 'Aug', rate: 78 }, { month: 'Sep', rate: 80 }, { month: 'Oct', rate: 82 },
  { month: 'Nov', rate: 79 }, { month: 'Dec', rate: 83 }, { month: 'Jan', rate: 87 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  visitors: i < 5 ? Math.round(Math.random() * 5) : i < 8 ? Math.round(50 + Math.random() * 60) : i < 11 ? Math.round(70 + Math.random() * 80) : i < 14 ? Math.round(55 + Math.random() * 60) : i < 17 ? Math.round(40 + Math.random() * 40) : i < 20 ? Math.round(80 + Math.random() * 100) : i < 22 ? Math.round(40 + Math.random() * 50) : Math.round(10 + Math.random() * 20),
}));

const topSlots = [
  { slot: '6PM – 7PM', visits: 198, pct: 99 }, { slot: '7PM – 8PM', visits: 182, pct: 91 },
  { slot: '8AM – 9AM', visits: 168, pct: 84 }, { slot: '5PM – 6PM', visits: 155, pct: 78 },
  { slot: '7AM – 8AM', visits: 142, pct: 71 },
];

const tooltip = { contentStyle: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 } };

export default function AnalyticsReports() {
  const [period, setPeriod] = useState('8W');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · ANALYTICS</div>
          <h1 className="page-title">ANALYTICS & <span style={{ color: 'var(--accent-orange)' }}>REPORTS</span></h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
            {['4W', '8W', '3M', '6M'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, background: period === p ? 'var(--accent-lime)' : 'transparent', color: period === p ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                {p}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export PDF</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid-4">
        {[
          { label: 'Avg Daily Checkins', value: '158', change: '+12%', up: true, color: 'var(--accent-blue)' },
          { label: 'Retention Rate', value: '87%', change: '+5%', up: true, color: 'var(--accent-green)' },
          { label: 'Avg Visit Duration', value: '62 min', change: '+8 min', up: true, color: 'var(--accent-purple)' },
          { label: 'Churn Rate', value: '4.2%', change: '-1.1%', up: false, color: 'var(--accent-amber)' },
        ].map(k => (
          <div key={k.label} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: k.color, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: k.up ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
              {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.change} vs prev period
            </div>
          </div>
        ))}
      </div>

      {/* Attendance trend */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div className="section-title">Weekly Attendance Trend</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><div style={{ width: 8, height: 2, background: 'var(--accent-blue)', borderRadius: 1 }} /> Total Check-ins</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><div style={{ width: 8, height: 2, background: 'var(--accent-lime)', borderRadius: 1 }} /> Unique Members</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={attendanceData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="checkinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-lime)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-lime)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltip} />
            <Area type="monotone" dataKey="checkins" name="Check-ins" stroke="var(--accent-blue)" fill="url(#checkinGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="unique" name="Unique Members" stroke="var(--accent-lime)" fill="url(#uniqueGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Retention */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Monthly Retention Rate</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={retentionData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 95]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...tooltip} formatter={v => [`${v}%`, 'Retention']} />
              <Line type="monotone" dataKey="rate" stroke="var(--accent-purple)" strokeWidth={2.5} dot={{ fill: 'var(--accent-purple)', strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top time slots */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Most Popular Time Slots</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topSlots.map((s, i) => (
              <div key={s.slot}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.slot}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-lime)' }}>{s.visits} visitors</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: `linear-gradient(90deg, var(--accent-lime), var(--accent-cyan))`, borderRadius: 100, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Average Hourly Traffic Pattern</div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 100 }}>
          {hourlyData.map((d, i) => {
            const pct = d.visitors / 200;
            const color = pct < 0.3 ? 'var(--accent-lime)' : pct < 0.6 ? 'var(--accent-amber)' : 'var(--accent-red)';
            return (
              <div key={i} title={`${d.hour}: ${d.visitors} visitors`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'default' }}>
                <div style={{ width: '100%', height: Math.max(4, d.visitors / 2), background: color, borderRadius: '3px 3px 0 0', opacity: 0.8, maxHeight: 100 }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          {['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'].map(t => (
            <span key={t} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
