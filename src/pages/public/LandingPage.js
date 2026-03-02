import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, BarChart3, Calendar, ArrowRight, CheckCircle, Star } from 'lucide-react';

const CROWD_VALUES = [42, 55, 78, 62, 48, 71, 58];

export default function LandingPage() {
  const navigate = useNavigate();
  const [crowdIdx, setCrowdIdx] = useState(0);
  const [crowdVal, setCrowdVal] = useState(62);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdIdx(i => (i + 1) % CROWD_VALUES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCrowdVal(CROWD_VALUES[crowdIdx]);
  }, [crowdIdx]);

  const crowdColor = crowdVal < 50 ? 'var(--accent-green)' : crowdVal < 75 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,11,16,0.8)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} fill="#000" color="#000" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.1em' }}>
            GYM<span style={{ color: 'var(--accent-green)' }}>FLOW</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ animation: 'fade-up 0.6s ease' }}>
            <div className="badge badge-green" style={{ marginBottom: 20 }}>
              <div className="live-dot" style={{ width: 6, height: 6 }} />
              Real-Time Gym Intelligence
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 6vw, 88px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              marginBottom: 24,
            }}>
              TRAIN<br />
              <span style={{ color: 'var(--accent-green)', WebkitTextStroke: '1px var(--accent-green)' }}>SMARTER.</span><br />
              NOT HARDER.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
              GymFlow gives you real-time crowd intelligence, AI-powered workout planning, and deep fitness analytics — all in one platform.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Start Free <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/app/dashboard')}>
                Live Demo
              </button>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
              {['No credit card', 'Free forever plan', '14-day Pro trial'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color="var(--accent-green)" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Crowd Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fade-up 0.8s ease' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${crowdColor}08, transparent 70%)` }} />
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div className="live-dot" style={{ width: 6, height: 6 }} /> Live Crowd Level — Gold's Gym, Koramangala
              </div>

              {/* Ring chart */}
              <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 20px' }}>
                <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="90" cy="90" r="75" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                  <circle cx="90" cy="90" r="75" fill="none" stroke={crowdColor} strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 75}`}
                    strokeDashoffset={`${2 * Math.PI * 75 * (1 - crowdVal / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: crowdColor, lineHeight: 1, transition: 'color 0.5s' }}>
                    {crowdVal}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>CAPACITY</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[{ label: 'LOW', color: 'var(--accent-green)', active: crowdVal < 50 },
                  { label: 'MED', color: 'var(--accent-yellow)', active: crowdVal >= 50 && crowdVal < 75 },
                  { label: 'HIGH', color: 'var(--accent-red)', active: crowdVal >= 75 }].map(s => (
                  <div key={s.label} style={{
                    padding: '4px 12px', borderRadius: 100,
                    background: s.active ? `${s.color}20` : 'var(--bg-elevated)',
                    border: `1px solid ${s.active ? s.color + '50' : 'transparent'}`,
                    fontSize: 11, fontWeight: 800, color: s.active ? s.color : 'var(--text-muted)',
                    transition: 'all 0.4s'
                  }}>{s.label}</div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Active Members', value: '2,847', icon: Users, color: 'var(--accent-blue)' },
                { label: 'Workouts Today', value: '1,203', icon: BarChart3, color: 'var(--accent-purple)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>Platform Features</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: '0.02em' }}>
            EVERYTHING YOU NEED TO<br />
            <span style={{ color: 'var(--accent-green)' }}>CRUSH YOUR GOALS</span>
          </h2>
        </div>
        <div className="grid-3">
          {[
            { icon: Users, title: 'Real-Time Crowd Tracking', desc: 'See live gym occupancy with color-coded intensity maps. Never wait for equipment again.', color: 'var(--accent-green)', badge: 'LIVE' },
            { icon: BarChart3, title: 'Workout Analytics', desc: 'Track progressive overload, PRs, and volume trends with beautiful data visualizations.', color: 'var(--accent-blue)' },
            { icon: Calendar, title: 'Smart Scheduling', desc: 'Sync with Google Calendar to find your perfect workout window based on crowd predictions.', color: 'var(--accent-purple)' },
            { icon: Zap, title: 'AI Recommendations', desc: 'Get personalized workout and diet plans powered by your performance data.', color: 'var(--accent-orange)' },
            { icon: Star, title: 'Diet Intelligence', desc: 'Track macros, calories, and get AI meal suggestions aligned with your fitness goals.', color: 'var(--accent-yellow)' },
            { icon: CheckCircle, title: 'Slot Booking', desc: 'Reserve your preferred time slot during low-crowd hours for a guaranteed smooth session.', color: 'var(--accent-green)' },
          ].map(({ icon: Icon, title, desc, color, badge }) => (
            <div key={title} className="card" style={{ position: 'relative' }}>
              {badge && <span className="badge badge-green" style={{ position: 'absolute', top: 16, right: 16, fontSize: 9 }}>{badge}</span>}
              <div style={{ width: 48, height: 48, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0,255,135,0.08), transparent 60%)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: '0.02em', marginBottom: 16 }}>
            READY TO FLOW?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
            Join 2,800+ members already training smarter with GymFlow.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Create Free Account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'var(--accent-green)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={12} fill="#000" color="#000" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.1em' }}>GYMFLOW</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 GymFlow. Built for athletes.</span>
      </footer>
    </div>
  );
}
