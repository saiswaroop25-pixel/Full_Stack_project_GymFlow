import React, { useState } from 'react';
import { Brain, TrendingDown, Users, Clock, Zap, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const churnRisk = [
  { name: 'Ananya Singh', risk: 92, lastVisit: '12 days ago', plan: 'Student', reason: 'Long absence + near expiry' },
  { name: 'Sneha Gupta', risk: 85, lastVisit: '21 days ago', plan: 'Student', reason: 'Very low visit frequency' },
  { name: 'Dev Kapoor', risk: 78, lastVisit: '8 days ago', plan: 'Basic', reason: 'Declining visit frequency' },
  { name: 'Ritesh Jain', risk: 72, lastVisit: '10 days ago', plan: 'Basic', reason: 'Missed 3 booked slots' },
  { name: 'Swati Reddy', risk: 65, lastVisit: '6 days ago', plan: 'Premium', reason: 'Reduced workout duration' },
];

const peakForecast = [
  { hour: '5PM', expected: 82, confidence: 94 }, { hour: '6PM', expected: 96, confidence: 97 },
  { hour: '7PM', expected: 88, confidence: 91 }, { hour: '8PM', expected: 62, confidence: 88 },
  { hour: '9PM', expected: 38, confidence: 85 },
];

const planSuggestions = [
  { member: 'Vikram Nair', suggestion: 'Upgrade to Annual (saves ₹3,988/year)', action: 'Upsell', color: 'var(--accent-lime)' },
  { member: 'Priya Sharma', suggestion: 'Add group classes to Basic plan', action: 'Cross-sell', color: 'var(--accent-cyan)' },
  { member: 'Kiran Patel', suggestion: 'Offer personal trainer trial (unused benefit)', action: 'Engage', color: 'var(--accent-purple)' },
];

export default function AIInsightsPage() {
  const [expandedChurn, setExpandedChurn] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · ARTIFICIAL INTELLIGENCE</div>
          <h1 className="page-title">AI <span style={{ color: 'var(--accent-orange)' }}>INSIGHTS</span></h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 100 }}>
          <Brain size={14} color="var(--accent-purple)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)' }}>AI Model v2.4 Active</span>
        </div>
      </div>

      {/* AI stats */}
      <div className="grid-4">
        {[
          { label: 'Members at Churn Risk', value: '28', color: 'var(--accent-red)', icon: TrendingDown },
          { label: 'Predicted Peak Hour', value: '6PM', color: 'var(--accent-amber)', icon: Clock },
          { label: 'Upsell Opportunities', value: '42', color: 'var(--accent-lime)', icon: Zap },
          { label: 'Prediction Accuracy', value: '94%', color: 'var(--accent-purple)', icon: Brain },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ border: `1px solid ${color}20` }}>
            <div style={{ width: 40, height: 40, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Churn prediction */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle size={16} color="var(--accent-red)" />
            <div className="section-title">Churn Risk Prediction</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {churnRisk.map(m => {
              const riskColor = m.risk > 85 ? 'var(--accent-red)' : m.risk > 70 ? 'var(--accent-amber)' : 'var(--accent-lime)';
              return (
                <div key={m.name} onClick={() => setExpandedChurn(expandedChurn === m.name ? null : m.name)}
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${riskColor}20`, borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: riskColor }}>{m.risk}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ width: `${m.risk}%`, height: '100%', background: riskColor, borderRadius: 100 }} />
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" style={{ transform: expandedChurn === m.name ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {expandedChurn === m.name && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fade-up 0.2s ease' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last Visit: <b style={{ color: 'var(--text-primary)' }}>{m.lastVisit}</b></span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Plan: <b style={{ color: 'var(--text-primary)' }}>{m.plan}</b></span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>⚡ {m.reason}</div>
                      <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>Send Re-engagement Offer</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Peak hour forecast */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={16} color="var(--accent-amber)" />
              <div className="section-title">Tonight's Peak Forecast</div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={peakForecast} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [`${v}%`, n === 'expected' ? 'Expected Crowd' : 'Confidence']} />
                <Bar dataKey="expected" name="expected" radius={[4, 4, 0, 0]}>
                  {peakForecast.map((e, i) => (
                    <Cell key={i} fill={e.expected < 60 ? 'var(--accent-lime)' : e.expected < 80 ? 'var(--accent-amber)' : 'var(--accent-red)'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8 }}>
              <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>6PM will be peak</span> — consider crowd alert at 5:30PM
            </div>
          </div>

          {/* Plan suggestions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={16} color="var(--accent-lime)" />
              <div className="section-title">Revenue Opportunities</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planSuggestions.map(s => (
                <div key={s.member} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{s.member}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.suggestion}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 10, fontWeight: 800, background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: 'nowrap' }}>{s.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI recommendations */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), var(--bg-card))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Brain size={16} color="var(--accent-purple)" />
          <div className="section-title">AI Recommendations for This Week</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { icon: '📧', title: 'Re-engagement Campaign', desc: 'Send personalized offers to 28 at-risk members. Predicted save rate: 62%.' },
            { icon: '📅', title: 'Off-Peak Incentive', desc: 'Offer 10% discount for visits before 4PM to reduce 6PM peak by ~15%.' },
            { icon: '💪', title: 'Equipment Optimization', desc: 'Add 2 more squat racks — demand analysis shows 38% queue abandonment.' },
          ].map(r => (
            <div key={r.title} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, border: '1px solid rgba(139,92,246,0.1)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.desc}</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, padding: '5px 12px', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--accent-purple)' }}>
                Apply Recommendation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
