import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Flame, Dumbbell, TrendingUp, Clock, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import { DashboardSkeleton } from '../../components/Skeleton';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
      </div>
    );
  }
  return null;
};

export default function UserDashboard() {
  const { user }  = useApp();
  const navigate  = useNavigate();
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Real data state
  const [crowd, setCrowd]       = useState({ crowdPct: 0, crowdLevel: 'LOW', checkedIn: 0 });
  const [todayDiet, setTodayDiet] = useState({ calories: 0, protein: 0 });
  const [dietGoals, setDietGoals] = useState({ calories: 2500 });
  const [attendance, setAttendance] = useState({ streak: 0, visitsThisMonth: 0 });
  const [actStats, setActStats]   = useState({ steps: 0, stepsGoal: 10000 });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [weeklyDiet, setWeeklyDiet] = useState([]);
  const [hourlySlots, setHourlySlots] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('crowd:update', (data) => {
    setCrowd(data);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [crowdRes, mealsRes, goalsRes, attRes, statsRes, workoutsRes, dietSummaryRes, slotsRes] =
          await Promise.allSettled([
            crowdAPI.getCurrent(),
            dietAPI.getMeals({ date: today }),
            dietAPI.getMacroGoals(),
            activityAPI.getAttendance({ days: 30 }),
            activityAPI.getStats(),
            workoutAPI.getLogs({ limit: 4 }),
            dietAPI.getSummary({ days: 7 }),
            crowdAPI.getHourly(),
          ]);

        if (crowdRes.status === 'fulfilled')       setCrowd(crowdRes.value.data.data || crowd);
        if (mealsRes.status === 'fulfilled')       setTodayDiet(mealsRes.value.data.totals || todayDiet);
        if (goalsRes.status === 'fulfilled')       setDietGoals(goalsRes.value.data.data || dietGoals);
        if (attRes.status === 'fulfilled')         setAttendance(attRes.value.data.data || attendance);
        if (statsRes.status === 'fulfilled')       setActStats(statsRes.value.data.data || actStats);
        if (workoutsRes.status === 'fulfilled')    setRecentWorkouts(workoutsRes.value.data.data || []);
        if (dietSummaryRes.status === 'fulfilled') {
          const summary = dietSummaryRes.value.data.data?.dailySummary || [];
          setWeeklyDiet(summary.map(d => ({ day: d.day, cal: d.calories, protein: Math.round(d.protein) })));
        }
        if (slotsRes.status === 'fulfilled') {
          const hourly = slotsRes.value.data.data || [];
          setHourlySlots(hourly.slice(0, 4).map(h => ({
            time: h.hour,
            crowd: h.crowd,
            label: h.crowd < 40 ? 'Low' : h.crowd < 70 ? 'Moderate' : 'Peak',
            color: h.crowd < 40 ? 'var(--accent-lime)' : h.crowd < 70 ? '#ffd166' : '#ff3b3b',
          })));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

  }, []);

  if (loading) return <DashboardSkeleton />;

  const crowdColor = crowd.crowdPct < 50 ? 'var(--accent-lime)' : crowd.crowdPct < 75 ? '#ffd166' : '#ff3b3b';
  const crowdLabel = crowd.crowdPct < 50 ? 'Low' : crowd.crowdPct < 75 ? 'Moderate' : 'Peak';
  const greeting   = time.getHours() < 12 ? 'MORNING' : time.getHours() < 17 ? 'AFTERNOON' : 'EVENING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.5s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
            {time.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="page-title">
            GOOD {greeting},<br />
            <span style={{ color: 'var(--accent-lime)' }}>{(user?.name || 'User').split(' ')[0].toUpperCase()}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff87', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {/* Stat cards — ALL REAL DATA */}
      <div className="grid-4">
        {[
          {
            label: 'Crowd Level', icon: Users, color: crowdColor,
            value: `${crowd.crowdPct}%`, sub: crowdLabel,
            action: () => navigate('/app/crowd'),
          },
          {
            label: 'Cal Today', icon: Flame, color: '#ff6b35',
            value: Math.round(todayDiet.calories).toLocaleString(),
            sub: `/ ${dietGoals.calories} goal`,
          },
          {
            label: 'Workout Streak', icon: Dumbbell, color: '#a78bfa',
            value: `${attendance.streak} days`,
            sub: attendance.streak > 0 ? 'Keep it up!' : 'Start today!',
          },
          {
            label: 'Steps Today', icon: TrendingUp, color: '#00d4ff',
            value: (actStats.steps || 0).toLocaleString(),
            sub: `/ ${(actStats.stepsGoal || 10000).toLocaleString()} goal`,
          },
        ].map(({ label, value, sub, icon: Icon, color, action }) => (
          <div key={label} className="card" onClick={action}
            style={{ cursor: action ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', padding: 20 }}>
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

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Weekly calorie chart — REAL DATA */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Weekly Overview</div>
            <span className="badge badge-cyan">Cal & Protein</span>
          </div>
          {weeklyDiet.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weeklyDiet} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cal"     name="Calories" stroke="#00d4ff" fill="url(#calGrad)"     strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="protein" name="Protein"  stroke="#ff6b35" fill="url(#proteinGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Log meals to see your weekly chart
            </div>
          )}
        </div>

        {/* Best time to visit — REAL hourly data */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Best Time to Visit</div>
          {hourlySlots.length > 0 ? (
            hourlySlots.map(({ time: t, crowd: c, label, color }) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 70, fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${c}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.5s' }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color, fontWeight: 700, width: 36, textAlign: 'right' }}>{c}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>{label}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No hourly data yet today</div>
          )}
          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => navigate('/app/slots')}>
            Book a Slot <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Recent workouts — REAL DATA */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Recent Workouts</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/workout')}>Log Workout</button>
          </div>
          {recentWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
              No workouts yet — <span style={{ color: 'var(--accent-lime)', cursor: 'pointer' }} onClick={() => navigate('/app/workout')}>log your first one!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentWorkouts.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(167,139,250,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Dumbbell size={16} color="#a78bfa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(w.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{w.duration}m</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.exercises?.length || 0} exercises</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Quick Access</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Log Meal',      icon: Flame,      path: '/app/diet',      color: '#ff6b35' },
              { label: 'Check Crowd',  icon: Users,      path: '/app/crowd',     color: 'var(--accent-lime)' },
              { label: 'View Progress',icon: TrendingUp, path: '/app/analytics', color: '#00d4ff' },
              { label: 'Book Slot',    icon: Clock,      path: '/app/slots',     color: '#a78bfa' },
              { label: 'Set Goal',     icon: Zap,        path: '/app/goals',     color: '#ffd166' },
            ].map(({ label, icon: Icon, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}>
                <div style={{ width: 32, height: 32, background: `${color}15`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
