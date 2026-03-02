import React, { useState } from 'react';
import { Plus, Trash2, Check, Search, ChevronDown, Timer } from 'lucide-react';

const EXERCISES_DB = {
  Chest: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Cable Flyes', 'Push-Ups', 'Chest Dips'],
  Back: ['Deadlift', 'Pull-Ups', 'Barbell Rows', 'Lat Pulldown', 'Seated Cable Row', 'Face Pulls'],
  Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Arnold Press', 'Rear Delt Flyes', 'Shrugs'],
  Legs: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raises'],
  Arms: ['Bicep Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crushers', 'Preacher Curl', 'Dips'],
  Core: ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Cable Crunches', 'Hanging Knee Raises'],
};

const TEMPLATES = [
  { name: 'Push Day A', muscles: ['Chest', 'Shoulders', 'Triceps'], exercises: 6 },
  { name: 'Pull Day A', muscles: ['Back', 'Biceps'], exercises: 5 },
  { name: 'Leg Day A', muscles: ['Quads', 'Hamstrings', 'Calves'], exercises: 6 },
  { name: 'Upper Body', muscles: ['Chest', 'Back', 'Shoulders'], exercises: 8 },
];

const SET_COLORS = ['var(--accent-green)', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-orange)'];

export default function WorkoutLoggerPage() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Bench Press', muscle: 'Chest', sets: [{ reps: 8, weight: 80, done: false }, { reps: 8, weight: 80, done: false }, { reps: 8, weight: 80, done: false }] },
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('Chest');
  const [searchEx, setSearchEx] = useState('');
  const [tab, setTab] = useState('log');
  const [timer, setTimer] = useState(null);
  const [timerVal, setTimerVal] = useState(0);

  const addExercise = (name, muscle) => {
    setExercises(ex => [...ex, { id: Date.now(), name, muscle, sets: [{ reps: 10, weight: 0, done: false }] }]);
    setShowPicker(false);
  };

  const addSet = (exId) => {
    setExercises(ex => ex.map(e => e.id === exId ? { ...e, sets: [...e.sets, { reps: e.sets[e.sets.length - 1].reps, weight: e.sets[e.sets.length - 1].weight, done: false }] } : e));
  };

  const updateSet = (exId, setIdx, field, val) => {
    setExercises(ex => ex.map(e => e.id === exId ? {
      ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: val } : s)
    } : e));
  };

  const toggleSet = (exId, setIdx) => {
    setExercises(ex => ex.map(e => e.id === exId ? {
      ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, done: !s.done } : s)
    } : e));
  };

  const removeExercise = (id) => setExercises(ex => ex.filter(e => e.id !== id));

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const totalVolume = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).reduce((b, s) => b + (s.reps * s.weight), 0), 0);

  const filteredEx = Object.entries(EXERCISES_DB).flatMap(([muscle, list]) =>
    list.filter(e => e.toLowerCase().includes(searchEx.toLowerCase())).map(e => ({ name: e, muscle }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="page-title">WORKOUT <span style={{ color: 'var(--accent-green)' }}>LOGGER</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Log every rep. Track every gain.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm">
            <Timer size={16} /> Rest Timer
          </button>
          <button className="btn btn-primary btn-sm" disabled={doneSets === 0}>
            <Check size={16} /> Finish Workout
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card card-sm" style={{ padding: '16px 20px' }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div><span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent-green)' }}>{doneSets}</span><span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>/ {totalSets} sets</span></div>
            <div><span style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{totalVolume.toLocaleString()}</span><span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>kg volume</span></div>
            <div><span style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{exercises.length}</span><span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>exercises</span></div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0}% complete
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 100 }}>
          <div style={{ width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%`, height: '100%', background: 'var(--accent-green)', borderRadius: 100, transition: 'width 0.4s' }} />
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Log Workout</button>
        <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'log' && (
        <>
          {/* Workout name */}
          <input className="input" placeholder="Workout name (e.g. Push Day - Monday)"
            value={workoutName} onChange={e => setWorkoutName(e.target.value)}
            style={{ fontSize: 16, fontWeight: 700 }} />

          {/* Exercise list */}
          {exercises.map((ex, ei) => (
            <div key={ex.id} className="card" style={{ padding: 20 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{ex.name}</div>
                  <span className="badge badge-purple" style={{ marginTop: 4 }}>{ex.muscle}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeExercise(ex.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Set headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 48px', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                {['SET', 'WEIGHT (kg)', 'REPS', 'VOL', ''].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>

              {ex.sets.map((set, si) => (
                <div key={si} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 48px', gap: 8, alignItems: 'center',
                  padding: '6px 4px', borderRadius: 8, marginBottom: 4,
                  background: set.done ? 'rgba(0,255,135,0.04)' : 'transparent',
                  border: set.done ? '1px solid rgba(0,255,135,0.1)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: SET_COLORS[si % 4] }}>
                    {si + 1}
                  </div>
                  <input className="input" type="number" value={set.weight}
                    onChange={e => updateSet(ex.id, si, 'weight', +e.target.value)}
                    style={{ padding: '8px 10px', fontSize: 14, fontFamily: 'var(--font-mono)', textDecoration: set.done ? 'line-through' : 'none', opacity: set.done ? 0.6 : 1 }} />
                  <input className="input" type="number" value={set.reps}
                    onChange={e => updateSet(ex.id, si, 'reps', +e.target.value)}
                    style={{ padding: '8px 10px', fontSize: 14, fontFamily: 'var(--font-mono)', textDecoration: set.done ? 'line-through' : 'none', opacity: set.done ? 0.6 : 1 }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {set.weight * set.reps}
                  </div>
                  <button onClick={() => toggleSet(ex.id, si)}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${set.done ? 'var(--accent-green)' : 'var(--border)'}`, background: set.done ? 'var(--accent-green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {set.done && <Check size={16} color="#000" strokeWidth={3} />}
                  </button>
                </div>
              ))}

              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => addSet(ex.id)}>
                <Plus size={14} /> Add Set
              </button>
            </div>
          ))}

          {/* Add exercise */}
          {!showPicker ? (
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: 16, borderStyle: 'dashed' }} onClick={() => setShowPicker(true)}>
              <Plus size={18} /> Add Exercise
            </button>
          ) : (
            <div className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="section-title">Choose Exercise</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPicker(false)}>Cancel</button>
              </div>

              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Search exercises..." value={searchEx} onChange={e => setSearchEx(e.target.value)} style={{ paddingLeft: 36 }} />
              </div>

              {!searchEx && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {Object.keys(EXERCISES_DB).map(g => (
                    <button key={g} onClick={() => setSelectedGroup(g)}
                      className={`btn btn-sm ${selectedGroup === g ? 'btn-primary' : 'btn-ghost'}`}>{g}</button>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {(searchEx ? filteredEx : (EXERCISES_DB[selectedGroup] || []).map(n => ({ name: n, muscle: selectedGroup }))).map(ex => (
                  <button key={ex.name} onClick={() => addExercise(ex.name, ex.muscle || selectedGroup)}
                    style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.color = 'var(--accent-green)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'templates' && (
        <div className="grid-2">
          {TEMPLATES.map(t => (
            <div key={t.name} className="card" style={{ cursor: 'pointer' }}
              onClick={() => setTab('log')}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{t.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {t.muscles.map(m => <span key={m} className="badge badge-blue">{m}</span>)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{t.exercises} exercises</div>
              <button className="btn btn-primary btn-sm">Use Template</button>
            </div>
          ))}
          <div className="card" style={{ cursor: 'pointer', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 120 }}>
            <Plus size={24} color="var(--text-muted)" />
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Create Template</span>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { date: 'Yesterday', name: 'Pull Day A', duration: '52 min', volume: '8,420 kg', exercises: 5 },
            { date: 'Mon, Feb 24', name: 'Push Day A', duration: '58 min', volume: '9,100 kg', exercises: 6 },
            { date: 'Sat, Feb 22', name: 'Leg Day', duration: '65 min', volume: '12,800 kg', exercises: 6 },
            { date: 'Fri, Feb 21', name: 'Upper Body', duration: '70 min', volume: '10,200 kg', exercises: 8 },
          ].map(w => (
            <div key={w.date} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{w.date.split(',')[0]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{w.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.exercises} exercises · {w.duration}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent-green)' }}>{w.volume}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>total volume</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
