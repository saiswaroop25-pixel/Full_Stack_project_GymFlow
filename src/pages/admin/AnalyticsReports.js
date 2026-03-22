import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Loader } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsReports() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('4W');

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminAPI.getAnalytics({ period });
      setData(res.data);
    } catch { } finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
      <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--text-secondary)' }}>Loading analytics...</span>
    </div>
  );

  const { avgDailyAttendance, totalCheckIns, totalWorkouts, newMembersCount, weeklyAttendance, memberGrowth, peakHour } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">ANALYTICS & REPORTS</h1>
          <p className="page-subtitle">Gym performance metrics and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['4W','8W','3M','6M'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Avg Daily Attendance', value: avgDailyAttendance, color: '#00d4ff' },
          { label: 'Total Check-Ins',      value: totalCheckIns,      color: '#00ff87' },
          { label: 'Total Workouts',       value: totalWorkouts,      color: '#a78bfa' },
          { label: 'New Members',          value: newMembersCount,    color: '#ffd166' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>WEEKLY ATTENDANCE TREND</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Check-ins" stroke="#00d4ff" fill="url(#attGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>MEMBER GROWTH</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={memberGrowth} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="New Members" fill="#ffd166" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak hour */}
      {peakHour && (
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ padding: '20px 28px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#ff6b35' }}>{peakHour.hour}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>PEAK HOUR</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>BUSIEST TIME OF DAY</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {peakHour.checkins} check-ins recorded at this hour during the selected period.
              Consider incentivising off-peak visits to reduce congestion.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
