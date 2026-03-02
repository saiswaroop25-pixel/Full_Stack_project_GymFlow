import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(role === 'admin' ? '/admin/dashboard' : '/app/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,135,0.05), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.05), transparent 60%)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', animation: 'fade-up 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--accent-green)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} fill="#000" color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.1em' }}>
              GYM<span style={{ color: 'var(--accent-green)' }}>FLOW</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Welcome back. Let's get moving.</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Role toggle */}
          <div className="tabs" style={{ marginBottom: 28 }}>
            <button className={`tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>Member</button>
            <button className={`tab ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>Gym Admin</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="email" placeholder="you@example.com"
                  style={{ paddingLeft: 40 }}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 13, color: 'var(--accent-green)', cursor: 'pointer' }}>Forgot password?</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 18, height: 18 }} />
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          New to GymFlow?{' '}
          <Link to="/register" style={{ color: 'var(--accent-green)', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
