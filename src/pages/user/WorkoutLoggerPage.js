import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../api';
import { Plus, Trash2, Save, Dumbbell, Clock, Flame, TrendingUp, Loader } from 'lucide-react';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Core','Cardio'];
const EXERCISES = ['Bench Press','Incline DB Press','Deadlift','Barbell Row','Lat Pulldown','Squat','Leg Press','Shoulder Press','Bicep Curl','Tricep Pushdown','Pull-Up','Dips','Romanian Deadlift','Cable Flye','Lateral Raise','Plank'];

export default function WorkoutLoggerPage() {
  const [logs, setLogs]       = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', duration: '', calories: '', notes: '',
    exercises: [{ name: '', muscleGroup: '', sets: [{ reps: '', weight: '' }] }],
  });

  useEffect(() => { loadLogs(); loadTemplates(); }, []);

  const loadLogs = async () => {
    try {
      const { data } = await workoutAPI.getLogs({ limit: 10 });
      setLogs(data.data || []);
    } catch (err) {
      setError('Failed to load workouts.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data } = await workoutAPI.getTemplates();
      setTemplates(data.data || []);
    } catch (_) {
      setTemplates([]);
    }
  };

  const addExercise = () =>
    setForm(f => ({ ...f, exercises: [...f.exercises, { name: '', muscleGroup: '', sets: [{ reps: '', weight: '' }] }] }));

  const removeExercise = (i) =>
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const addSet = (exIdx) =>
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[exIdx].sets.push({ reps: '', weight: '' });
      return { ...f, exercises };
    });

  const updateExercise = (exIdx, field, value) =>
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[exIdx][field] = value;
      return { ...f, exercises };
    });

  const updateSet = (exIdx, setIdx, field, value) =>
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[exIdx].sets[setIdx][field] = value;
      return { ...f, exercises };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await workoutAPI.createLog({
        ...form,
        duration: parseInt(form.duration),
        calories: form.calories ? parseInt(form.calories) : null,
        exercises: form.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ reps: parseInt(s.reps), weight: parseFloat(s.weight) })),
        })),
      });
      setSuccess('Workout logged successfully!');
      setShowForm(false);
      setForm({ name: '', duration: '', calories: '', notes: '', exercises: [{ name: '', muscleGroup: '', sets: [{ reps: '', weight: '' }] }] });
      loadLogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await workoutAPI.deleteLog(id);
      setLogs(l => l.filter(w => w.id !== id));
    } catch {
      setError('Failed to delete workout.');
    }
  };

  const applyTemplate = async (id) => {
    try {
      const { data } = await workoutAPI.useTemplate(id);
      const template = data.data;
      setForm({
        name: template.name || '',
        duration: '',
        calories: '',
        notes: template.goal || '',
        exercises: (template.exercises || []).map((exercise) => ({
          ...exercise,
          sets: (exercise.sets || []).map((set) => ({ reps: String(set.reps ?? ''), weight: String(set.weight ?? '') })),
        })),
      });
      setShowForm(true);
    } catch {
      setError('Failed to load template.');
    }
  };

  const saveCurrentTemplate = async () => {
    if (!form.name || form.exercises.length === 0) return;
    try {
      await workoutAPI.createTemplate({
        name: form.name,
        goal: form.notes,
        exercises: form.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({ reps: parseInt(set.reps || 0, 10), weight: parseFloat(set.weight || 0) })),
        })),
      });
      setSuccess('Template saved.');
      loadTemplates();
    } catch {
      setError('Failed to save template.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">WORKOUT LOGGER</h1>
          <p className="page-subtitle">Log and track your training sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Log Workout'}
        </button>
      </div>

      {/* Alerts */}
      {error   && <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      {templates.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12 }}>QUICK TEMPLATES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {templates.map((template) => (
              <button key={template.id} className="btn btn-secondary btn-sm" type="button" onClick={() => applyTemplate(template.id)}>
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>NEW WORKOUT</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Workout Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Push Day, Leg Day..." required />
              </div>
              <div>
                <label className="form-label">Duration (min)</label>
                <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="60" required />
              </div>
              <div>
                <label className="form-label">Calories Burned</label>
                <input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="350" />
              </div>
            </div>

            {/* Exercises */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>EXERCISES</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addExercise}><Plus size={14} /> Add Exercise</button>
              </div>

              {form.exercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, marginBottom: 10 }}>
                    <select value={ex.name} onChange={e => updateExercise(exIdx, 'name', e.target.value)} required>
                      <option value="">Select Exercise</option>
                      {EXERCISES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select value={ex.muscleGroup} onChange={e => updateExercise(exIdx, 'muscleGroup', e.target.value)}>
                      <option value="">Muscle Group</option>
                      {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button type="button" onClick={() => removeExercise(exIdx)} style={{ background: 'rgba(255,59,59,0.15)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#ff3b3b' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Sets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 40 }}>SET {sIdx + 1}</span>
                        <input type="number" value={s.reps} onChange={e => updateSet(exIdx, sIdx, 'reps', e.target.value)} placeholder="Reps" required />
                        <input type="number" value={s.weight} onChange={e => updateSet(exIdx, sIdx, 'weight', e.target.value)} placeholder="Weight (kg)" required />
                      </div>
                    ))}
                    <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => addSet(exIdx)}>
                      <Plus size={12} /> Add Set
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="form-label">Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="How did it go?" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
              {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save Workout</>}
            </button>
            <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={saveCurrentTemplate}>
              Save As Template
            </button>
          </form>
        </div>
      )}

      {/* Workout Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>RECENT WORKOUTS</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading workouts...</div>
        ) : logs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Dumbbell size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text-secondary)' }}>No workouts logged yet. Click "Log Workout" to start!</div>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>{log.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <button onClick={() => deleteLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                {[
                  { icon: Clock,      label: `${log.duration} min` },
                  { icon: Flame,      label: log.calories ? `${log.calories} kcal` : 'No data' },
                  { icon: Dumbbell,   label: `${log.exercises?.length || 0} exercises` },
                  { icon: TrendingUp, label: log.volume ? `${log.volume.toFixed(0)} kg vol` : '' },
                ].filter(s => s.label).map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Icon size={14} /> {label}
                  </div>
                ))}
              </div>

              {log.exercises && log.exercises.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...new Set(log.exercises.map(e => e.name))].map(name => (
                    <span key={name} style={{ padding: '3px 10px', background: 'var(--bg-elevated)', borderRadius: 100, fontSize: 12, color: 'var(--text-secondary)' }}>{name}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
