import React, { useEffect, useMemo, useState } from 'react';
import { activityAPI, authAPI, workoutAPI } from '../../api';
import { Plus, Loader, Target, Dumbbell, Footprints } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function GoalManagementPage() {
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [editingWeight, setEditingWeight] = useState(false);
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, activityRes, analyticsRes] = await Promise.all([
          authAPI.getMe(),
          activityAPI.getStats(),
          workoutAPI.getAnalytics({ weeks: 8 }),
        ]);

        const user = profileRes.data.user;
        setProfile(user);
        setTargetWeight(user?.targetWeight ?? '');
        setActivity(activityRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch (err) {
        setError('Failed to load goals.');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const goals = useMemo(() => {
    if (!profile || !activity || !analytics) return [];

    const items = [];

    if (profile.weight && profile.targetWeight) {
      const start = profile.weight;
      const current = profile.weight;
      const target = profile.targetWeight;
      const totalDelta = Math.abs(target - start) || 1;
      const progress = totalDelta === 0 ? 100 : Math.round((Math.abs(current - start) / totalDelta) * 100);

      items.push({
        id: 'weight',
        name: 'Target Weight',
        current,
        target,
        start,
        unit: 'kg',
        progress: Math.min(100, progress),
        color: 'var(--accent-green)',
        helper: profile.goal.replaceAll('_', ' '),
      });
    }

    items.push({
      id: 'steps',
      name: 'Daily Steps',
      current: activity.steps || 0,
      target: activity.stepsGoal || 10000,
      start: 0,
      unit: 'steps',
      progress: Math.min(100, Math.round(((activity.steps || 0) / (activity.stepsGoal || 10000)) * 100)),
      color: 'var(--accent-blue)',
      helper: 'Estimated from workouts and attendance',
    });

    const topPr = (analytics.prs || []).reduce((best, current) => (!best || current.weight > best.weight ? current : best), null);
    if (topPr) {
      const target = Math.ceil(topPr.weight / 5) * 5 + 10;
      items.push({
        id: 'strength',
        name: `${topPr.exercise} PR`,
        current: topPr.weight,
        target,
        start: Math.max(0, topPr.weight - 20),
        unit: 'kg',
        progress: Math.min(100, Math.round(((topPr.weight - Math.max(0, topPr.weight - 20)) / (target - Math.max(0, topPr.weight - 20))) * 100)),
        color: 'var(--accent-purple)',
        helper: 'Target auto-set from your best logged lift',
      });
    }

    return items;
  }, [profile, activity, analytics]);

  const volumeTrend = useMemo(() => {
    return (analytics?.volumeByWeek || []).map((entry, index) => ({
      week: `W${index + 1}`,
      volume: Math.round(entry.volume || 0),
    }));
  }, [analytics]);

  const saveTargetWeight = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await authAPI.updateProfile({ targetWeight });
      setProfile(data.user);
      setTargetWeight(data.user.targetWeight ?? '');
      setEditingWeight(false);
      setSuccess('Target weight updated.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update target weight.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
        <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading goals...</span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={{ padding: 16, background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">GOAL <span style={{ color: 'var(--accent-yellow)' }}>MANAGER</span></h1>
          <p className="page-subtitle">Progress from your live profile, workouts, and attendance</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditingWeight((current) => !current)}>
          <Plus size={16} /> {editingWeight ? 'Close Editor' : 'Edit Weight Goal'}
        </button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      {editingWeight && (
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'end', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Target Weight (kg)</label>
            <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="Set your target" />
          </div>
          <button className="btn btn-primary" onClick={saveTargetWeight} disabled={saving}>
            {saving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Save Goal'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {goals.map((goal) => (
          <div key={goal.id} className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{goal.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{goal.helper}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: goal.color }}>{goal.progress}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>complete</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Start: <strong style={{ color: 'var(--text-primary)' }}>{goal.start} {goal.unit}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Current: <strong style={{ color: goal.color }}>{goal.current} {goal.unit}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Target: <strong style={{ color: 'var(--text-primary)' }}>{goal.target} {goal.unit}</strong></span>
            </div>

            <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999 }}>
              <div style={{ width: `${goal.progress}%`, height: '100%', background: goal.color, borderRadius: 999, boxShadow: `0 0 10px ${goal.color}50`, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Weekly Training Volume</div>
          {volumeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={volumeTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(value) => [`${value} kg`, 'Volume']} />
                <Line type="monotone" dataKey="volume" stroke="var(--accent-green)" strokeWidth={2.5} dot={{ fill: 'var(--accent-green)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Log workouts to build your progress trend.</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-sm" style={{ background: 'rgba(255,214,102,0.08)', border: '1px solid rgba(255,214,102,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Target size={16} color="var(--accent-yellow)" />
              <div style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>Primary Goal</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>{profile?.goal?.replaceAll('_', ' ')}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Current plan: {profile?.plan}
            </div>
          </div>

          <div className="card card-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Dumbbell size={16} color="var(--accent-purple)" />
              <div style={{ fontWeight: 700 }}>Workout Snapshot</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Workouts</span>
                <strong>{analytics?.totalWorkouts || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Duration</span>
                <strong>{analytics?.avgDuration || 0} min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Volume</span>
                <strong>{Math.round(analytics?.totalVolume || 0).toLocaleString()} kg</strong>
              </div>
            </div>
          </div>

          <div className="card card-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Footprints size={16} color="var(--accent-blue)" />
              <div style={{ fontWeight: 700 }}>Today</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Steps</span>
                <strong>{(activity?.steps || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Minutes</span>
                <strong>{activity?.activeMinutes || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Calories Burned</span>
                <strong>{activity?.caloriesBurned || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
