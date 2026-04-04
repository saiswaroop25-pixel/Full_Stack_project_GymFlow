import React, { useState, useEffect } from 'react';
import { dietAPI } from '../../api';
import { Plus, Trash2, Flame, Loader } from 'lucide-react';

const MEAL_NAMES = ['Breakfast', 'Morning Snack', 'Lunch', 'Pre-Workout', 'Post-Workout', 'Dinner', 'Late Snack'];

export default function DietTrackerPage() {
  const [meals, setMeals]       = useState([]);
  const [foodResults, setFoodResults] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [foodQuery, setFoodQuery] = useState('');
  const [totals, setTotals]     = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goals, setGoals]       = useState({ calories: 2500, protein: 200, carbs: 280, fat: 70 });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    name: 'Breakfast', calories: '', protein: '', carbs: '', fat: '',
    items: [{ name: '', cal: '' }],
  });

  useEffect(() => { loadData(); loadExtras(); }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [mealsRes, goalsRes] = await Promise.all([
        dietAPI.getMeals({ date: today }),
        dietAPI.getMacroGoals(),
      ]);
      setMeals(mealsRes.data.data || []);
      setTotals(mealsRes.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      setGoals(goalsRes.data.data || goals);
    } catch (err) {
      setError('Failed to load meals.');
    } finally {
      setLoading(false);
    }
  };

  const loadExtras = async () => {
    try {
      const week = new Date().toISOString().split('T')[0];
      const [savedRes, planRes] = await Promise.all([
        dietAPI.getSavedMeals(),
        dietAPI.getMealPlan(week),
      ]);
      setSavedMeals(savedRes.data.data || []);
      setMealPlan(planRes.data.data || null);
    } catch (_) {
      setSavedMeals([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await dietAPI.createMeal({
        name:     form.name,
        calories: parseInt(form.calories),
        protein:  parseFloat(form.protein),
        carbs:    parseFloat(form.carbs),
        fat:      parseFloat(form.fat),
        items:    form.items.filter(i => i.name),
      });
      setSuccess('Meal logged!');
      setShowForm(false);
      setForm({ name: 'Breakfast', calories: '', protein: '', carbs: '', fat: '', items: [{ name: '', cal: '' }] });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log meal.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMeal = async (id) => {
    try {
      await dietAPI.deleteMeal(id);
      loadData();
    } catch {
      setError('Failed to delete meal.');
    }
  };

  const searchFood = async () => {
    try {
      const { data } = await dietAPI.searchFoods(foodQuery);
      setFoodResults(data.data || []);
    } catch {
      setFoodResults([]);
    }
  };

  const saveCurrentMeal = async () => {
    try {
      await dietAPI.createSavedMeal({
        name: form.name,
        calories: parseInt(form.calories || 0, 10),
        protein: parseFloat(form.protein || 0),
        carbs: parseFloat(form.carbs || 0),
        fat: parseFloat(form.fat || 0),
        items: form.items.filter((item) => item.name),
      });
      setSuccess('Saved meal added.');
      loadExtras();
    } catch {
      setError('Failed to save meal template.');
    }
  };

  const macroBar = (val, goal, color) => (
    <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ width: `${Math.min(100, (val / goal) * 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">DIET TRACKER</h1>
          <p className="page-subtitle">Today's nutrition · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Log Meal'}
        </button>
      </div>

      {error   && <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12 }}>FOOD LIBRARY</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} placeholder="Search foods..." />
            <button className="btn btn-secondary" type="button" onClick={searchFood}>Search</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {foodResults.map((food) => (
              <div key={food.id} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-elevated)' }}>
                <div style={{ fontWeight: 700 }}>{food.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{food.calories} kcal · {food.protein}P · {food.carbs}C · {food.fat}F</div>
              </div>
            ))}
            {foodResults.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search to see quick nutrition references.</div>}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12 }}>MEAL PLAN</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{mealPlan?.notes || 'Starter weekly plan loaded.'}</div>
          {(mealPlan?.days || []).slice(0, 3).map((day) => (
            <div key={day.day} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{day.day}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{day.focus}</div>
            </div>
          ))}
          {savedMeals.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Saved Meals</div>
              {savedMeals.slice(0, 3).map((meal) => <div key={meal.id} style={{ fontSize: 13, marginBottom: 4 }}>{meal.name} · {meal.calories} kcal</div>)}
            </div>
          )}
        </div>
      </div>

      {/* Macro summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Calories', val: Math.round(totals.calories), goal: goals.calories, unit: 'kcal', color: '#ff6b35' },
          { label: 'Protein',  val: Math.round(totals.protein),  goal: goals.protein,  unit: 'g',    color: '#00ff87' },
          { label: 'Carbs',    val: Math.round(totals.carbs),    goal: goals.carbs,    unit: 'g',    color: '#ffd166' },
          { label: 'Fat',      val: Math.round(totals.fat),      goal: goals.fat,      unit: 'g',    color: '#a78bfa' },
        ].map(({ label, val, goal, unit, color }) => (
          <div key={label} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{label.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color }}>{val}<span style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>/ {goal}{unit} goal</div>
            {macroBar(val, goal, color)}
          </div>
        ))}
      </div>

      {/* Log Meal Form */}
      {showForm && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>LOG MEAL</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Meal</label>
                <select value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}>
                  {MEAL_NAMES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Calories</label>
                <input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="500" required />
              </div>
              <div>
                <label className="form-label">Protein (g)</label>
                <input type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="40" required />
              </div>
              <div>
                <label className="form-label">Carbs (g)</label>
                <input type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} placeholder="60" required />
              </div>
              <div>
                <label className="form-label">Fat (g)</label>
                <input type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} placeholder="15" required />
              </div>
            </div>

            {/* Food items */}
            <div>
              <label className="form-label">Food Items (optional)</label>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginBottom: 6 }}>
                  <input value={item.name} onChange={e => { const items = [...form.items]; items[i].name = e.target.value; setForm(f => ({ ...f, items })); }} placeholder="e.g. Chicken Breast 200g" />
                  <input type="number" value={item.cal} onChange={e => { const items = [...form.items]; items[i].cal = e.target.value; setForm(f => ({ ...f, items })); }} placeholder="kcal" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#ff3b3b' }}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, { name: '', cal: '' }] }))}>
                <Plus size={12} /> Add Item
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
              {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Flame size={16} /> Log Meal</>}
            </button>
            <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={saveCurrentMeal}>
              Save As Meal Template
            </button>
          </form>
        </div>
      )}

      {/* Meals list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>TODAY'S MEALS</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Flame size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text-secondary)' }}>No meals logged today. Click "Log Meal" to start tracking!</div>
          </div>
        ) : (
          meals.map(meal => (
            <div key={meal.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{meal.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {new Date(meal.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { label: 'Cal',     val: meal.calories, color: '#ff6b35' },
                      { label: 'Protein', val: `${Math.round(meal.protein)}g`, color: '#00ff87' },
                      { label: 'Carbs',   val: `${Math.round(meal.carbs)}g`,   color: '#ffd166' },
                      { label: 'Fat',     val: `${Math.round(meal.fat)}g`,     color: '#a78bfa' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color, fontWeight: 700 }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => deleteMeal(meal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
