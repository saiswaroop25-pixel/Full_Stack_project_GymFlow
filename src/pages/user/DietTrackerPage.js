import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Plus, Search, Flame, Zap, UtensilsCrossed, X } from 'lucide-react';

const FOOD_DB = [
  { name: 'Chicken Breast (100g)', cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (100g)', cal: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Whole Eggs (1 egg)', cal: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana (medium)', cal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Oats (100g)', cal: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Whey Protein (1 scoop)', cal: 120, protein: 24, carbs: 3, fat: 2 },
  { name: 'Almonds (30g)', cal: 174, protein: 6, carbs: 6, fat: 15 },
  { name: 'Greek Yogurt (200g)', cal: 130, protein: 22, carbs: 6, fat: 0.7 },
  { name: 'Sweet Potato (100g)', cal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Salmon (100g)', cal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Broccoli (100g)', cal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Peanut Butter (2 tbsp)', cal: 188, protein: 8, carbs: 6, fat: 16 },
];

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Pre-Workout', 'Post-Workout', 'Snacks'];

const MACRO_COLORS = {
  protein: 'var(--accent-blue)',
  carbs: 'var(--accent-orange)',
  fat: 'var(--accent-yellow)',
};

const GOALS = { cal: 2500, protein: 180, carbs: 250, fat: 70 };

const weekCalData = [
  { day: 'Mon', cal: 2380 }, { day: 'Tue', cal: 2520 },
  { day: 'Wed', cal: 2100 }, { day: 'Thu', cal: 2680 },
  { day: 'Fri', cal: 2400 }, { day: 'Sat', cal: 2890 }, { day: 'Sun', cal: 0 },
];

export default function DietTrackerPage() {
  const [meals, setMeals] = useState({
    Breakfast: [{ ...FOOD_DB[4], qty: 1.5 }, { ...FOOD_DB[2], qty: 3 }],
    Lunch: [{ ...FOOD_DB[0], qty: 2 }, { ...FOOD_DB[1], qty: 1.5 }],
    Dinner: [],
    'Pre-Workout': [{ ...FOOD_DB[5], qty: 1 }, { ...FOOD_DB[3], qty: 1 }],
    'Post-Workout': [],
    Snacks: [{ ...FOOD_DB[6], qty: 1 }],
  });
  const [activeMeal, setActiveMeal] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('today');

  const totals = Object.values(meals).flat().reduce((acc, item) => ({
    cal: acc.cal + item.cal * item.qty,
    protein: acc.protein + item.protein * item.qty,
    carbs: acc.carbs + item.carbs * item.qty,
    fat: acc.fat + item.fat * item.qty,
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });

  const addFood = (food, meal) => {
    setMeals(m => ({ ...m, [meal]: [...m[meal], { ...food, qty: 1 }] }));
    setActiveMeal(null);
    setSearch('');
  };

  const removeFood = (meal, idx) => {
    setMeals(m => ({ ...m, [meal]: m[meal].filter((_, i) => i !== idx) }));
  };

  const pieData = [
    { name: 'Protein', value: Math.round(totals.protein * 4), color: MACRO_COLORS.protein },
    { name: 'Carbs', value: Math.round(totals.carbs * 4), color: MACRO_COLORS.carbs },
    { name: 'Fat', value: Math.round(totals.fat * 9), color: MACRO_COLORS.fat },
  ];

  const filtered = FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">DIET <span style={{ color: 'var(--accent-orange)' }}>TRACKER</span></h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Fuel your performance.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveMeal('Breakfast')}>
          <Plus size={16} /> Log Meal
        </button>
      </div>

      {/* Macro overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Calorie ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--accent-orange)" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(totals.cal / GOALS.cal, 1))}`}
                style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 8px rgba(255,107,53,0.5))' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--accent-orange)', lineHeight: 1 }}>{Math.round(totals.cal)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>of {GOALS.cal} kcal</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{GOALS.cal - Math.round(totals.cal)}</span> kcal remaining
          </div>
        </div>

        {/* Macros */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Macro Breakdown</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Protein', val: totals.protein, goal: GOALS.protein, color: MACRO_COLORS.protein, unit: 'g' },
                { label: 'Carbs', val: totals.carbs, goal: GOALS.carbs, color: MACRO_COLORS.carbs, unit: 'g' },
                { label: 'Fat', val: totals.fat, goal: GOALS.fat, color: MACRO_COLORS.fat, unit: 'g' },
              ].map(({ label, val, goal, color, unit }) => (
                <div key={label}>
                  <div className="flex-between" style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color }}>{Math.round(val)}{unit} <span style={{ color: 'var(--text-muted)' }}>/ {goal}{unit}</span></span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 100 }}>
                    <div style={{ width: `${Math.min(100, (val / goal) * 100)}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.5s', boxShadow: `0 0 8px ${color}50` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>Today's Log</button>
        <button className={`tab ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>Weekly</button>
        <button className={`tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>AI Suggestions</button>
      </div>

      {tab === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MEALS.map(meal => (
            <div key={meal} className="card" style={{ padding: 20 }}>
              <div className="flex-between" style={{ marginBottom: meals[meal].length ? 16 : 0 }}>
                <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{meal}</span>
                  {meals[meal].length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', alignSelf: 'center', marginLeft: 8 }}>
                      {Math.round(meals[meal].reduce((a, f) => a + f.cal * f.qty, 0))} kcal
                    </span>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveMeal(activeMeal === meal ? null : meal)}>
                  <Plus size={14} /> Add Food
                </button>
              </div>

              {meals[meal].map((food, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < meals[meal].length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      P: {Math.round(food.protein * food.qty)}g · C: {Math.round(food.carbs * food.qty)}g · F: {Math.round(food.fat * food.qty)}g
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent-orange)' }}>
                    {Math.round(food.cal * food.qty)} kcal
                  </div>
                  <button onClick={() => removeFood(meal, idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}

              {meals[meal].length === 0 && activeMeal !== meal && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No food logged yet</div>
              )}

              {activeMeal === meal && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Search food..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ paddingLeft: 36, fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    {filtered.map(food => (
                      <button key={food.name} onClick={() => addFood(food, meal)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{food.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>{food.cal} kcal</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'week' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Weekly Calorie Intake</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekCalData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(val) => [`${val} kcal`, 'Calories']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cal" radius={[6, 6, 0, 0]}>
                {weekCalData.map((entry, i) => <Cell key={i} fill={entry.cal > GOALS.cal ? 'var(--accent-red)' : 'var(--accent-orange)'} opacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-orange)' }} /> Under Goal
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-red)' }} /> Over Goal
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { title: 'High-Protein Breakfast', desc: 'Greek yogurt parfait with berries, granola + 3 egg whites. ~420 kcal, 40g protein.', macro: '40P · 45C · 12F', color: 'var(--accent-blue)', tag: 'Breakfast' },
            { title: 'Pre-Workout Power Bowl', desc: 'Oats + banana + whey protein + almond butter. Perfect 60-90 min before training.', macro: '32P · 68C · 14F', color: 'var(--accent-orange)', tag: 'Pre-Workout' },
            { title: 'Post-Workout Recovery', desc: 'Chicken breast + white rice + broccoli. Fast-absorbing carbs + protein for muscle repair.', macro: '45P · 60C · 8F', color: 'var(--accent-green)', tag: 'Post-Workout' },
            { title: 'Light Evening Meal', desc: 'Salmon + sweet potato + mixed greens. Omega-3s for recovery, complex carbs for tomorrow.', macro: '38P · 40C · 18F', color: 'var(--accent-purple)', tag: 'Dinner' },
          ].map(s => (
            <div key={s.title} className="card" style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 4, borderRadius: 100, background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{s.title}</div>
                  <span className="badge badge-green">{s.tag}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{s.desc}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s.color }}>{s.macro} kcal</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, alignSelf: 'center' }}>Add to Log</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
