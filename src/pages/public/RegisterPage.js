import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, AlertCircle, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const GOALS = [
  { value: 'MUSCLE_GAIN',     label: 'Muscle Gain' },
  { value: 'FAT_LOSS',        label: 'Fat Loss' },
  { value: 'STRENGTH',        label: 'Strength' },
  { value: 'ENDURANCE',       label: 'Endurance' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
];

export default function RegisterPage() {
  const navigate     = useNavigate();
  const { register } = useApp();

  const [form, setForm]       = useState({ name: '', email: '', password: '', goal: 'GENERAL_FITNESS', height: '', weight: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-lime)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} fill="#000" color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.08em' }}>
              GYM<span style={{ color: 'var(--accent-lime)' }}>FLOW</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, marginBottom: 20, fontSize: 14, color: 'var(--accent-red)' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Arjun Mehta" required autoFocus />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
            </div>

            <div>
              <label className="form-label">Fitness Goal</label>
              <select name="goal" value={form.goal} onChange={handleChange}>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Height (cm) <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="178" />
              </div>
              <div>
                <label className="form-label">Weight (kg) <span style={{ color: 'var(--text-muted)' }}>optional</span></label>
                <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="75" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
