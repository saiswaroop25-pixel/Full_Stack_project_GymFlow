import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', goal: '', height: '', weight: '', password: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(0,255,135,0.06), transparent 60%)' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', animation: 'fade-up 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-green)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} fill="#000" color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em' }}>GYM<span style={{ color: 'var(--accent-green)' }}>FLOW</span></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start your fitness journey.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 100,
              background: s <= step ? 'var(--accent-green)' : 'var(--bg-elevated)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.05em' }}>BASIC INFO</h2>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.05em' }}>FITNESS PROFILE</h2>

              <div className="input-group">
                <label className="input-label">Primary Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => set('goal', g)}
                      style={{
                        padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
                        background: form.goal === g ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
                        border: `1px solid ${form.goal === g ? 'var(--accent-green)' : 'var(--border)'}`,
                        color: form.goal === g ? 'var(--accent-green)' : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>{g}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Height (cm)</label>
                  <input className="input" type="number" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Weight (kg)</label>
                  <input className="input" type="number" placeholder="72" value={form.weight} onChange={e => set('weight', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => navigate('/app/dashboard')}>
                  Let's Go! <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already a member?{' '}
          <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
