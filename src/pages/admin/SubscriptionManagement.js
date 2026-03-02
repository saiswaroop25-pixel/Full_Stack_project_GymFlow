import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, CreditCard } from 'lucide-react';

const PLANS = [
  { name: 'Basic', price: 999, members: 480, color: 'var(--accent-cyan)', features: ['Gym Access', 'Locker', 'Basic Analytics'] },
  { name: 'Premium', price: 1999, members: 520, color: 'var(--accent-purple)', features: ['All Basic', 'Group Classes', 'AI Recommendations', 'Priority Booking'] },
  { name: 'Student', price: 599, members: 148, color: 'var(--accent-lime)', features: ['Gym Access', 'Weekday Only', 'Basic Analytics'] },
  { name: 'Annual', price: 9999, members: 100, color: 'var(--accent-amber)', features: ['All Premium', 'Guest Passes', 'Personal Trainer (2/mo)', 'Nutrition Consult'] },
];

const TRANSACTIONS = [
  { id: '#TXN-5821', member: 'Arjun Mehta', plan: 'Premium', amount: 1999, date: 'Jan 28, 2024', status: 'success' },
  { id: '#TXN-5820', member: 'Vikram Nair', plan: 'Annual', amount: 9999, date: 'Jan 28, 2024', status: 'success' },
  { id: '#TXN-5819', member: 'Priya Sharma', plan: 'Basic', amount: 999, date: 'Jan 27, 2024', status: 'success' },
  { id: '#TXN-5818', member: 'Ananya Singh', plan: 'Student', amount: 599, date: 'Jan 27, 2024', status: 'failed' },
  { id: '#TXN-5817', member: 'Kiran Patel', plan: 'Premium', amount: 1999, date: 'Jan 26, 2024', status: 'success' },
  { id: '#TXN-5816', member: 'Meera Iyer', plan: 'Basic', amount: 999, date: 'Jan 26, 2024', status: 'pending' },
];

export default function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState('plans');
  const totalRevenue = PLANS.reduce((sum, p) => sum + p.price * p.members, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · SUBSCRIPTIONS</div>
          <h1 className="page-title">SUBSCRIPTION <span style={{ color: 'var(--accent-orange)' }}>MGMT</span></h1>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> New Plan</button>
      </div>

      {/* Revenue summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Monthly Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, color: 'var(--accent-green)' },
            { label: 'Active Subs', value: PLANS.reduce((s, p) => s + p.members, 0).toLocaleString(), color: 'var(--accent-blue)' },
            { label: 'Avg Revenue / User', value: `₹${Math.round(totalRevenue / PLANS.reduce((s, p) => s + p.members, 0))}`, color: 'var(--accent-purple)' },
            { label: 'Expiring in 7d', value: '24', color: 'var(--accent-amber)' },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <ResponsiveContainer width="50%" height={150}>
            <PieChart>
              <Pie data={PLANS} dataKey="members" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0}>
                {PLANS.map((p, i) => <Cell key={i} fill={p.color} opacity={0.85} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, 'Members']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.members} members</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
        {['plans', 'transactions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: activeTab === tab ? 'var(--accent-lime)' : 'transparent', color: activeTab === tab ? '#000' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'plans' && (
        <div className="grid-4">
          {PLANS.map(plan => (
            <div key={plan.name} className="card" style={{ border: `1px solid ${plan.color}30`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `${plan.color}08`, borderRadius: '0 20px 0 60px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text-primary)', lineHeight: 1 }}>₹{plan.price.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>/month</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: plan.color, marginBottom: 4 }}>{plan.members}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Active Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <Edit2 size={12} /> Edit Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Transaction ID</th><th>Member</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{t.id}</span></td>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{t.member}</td>
                  <td>
                    <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${PLANS.find(p => p.name === t.plan)?.color}15`, color: PLANS.find(p => p.name === t.plan)?.color }}>
                      {t.plan}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>₹{t.amount.toLocaleString()}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.date}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: t.status === 'success' ? 'rgba(0,255,135,0.1)' : t.status === 'failed' ? 'rgba(255,59,59,0.1)' : 'rgba(255,184,0,0.1)', color: t.status === 'success' ? 'var(--accent-green)' : t.status === 'failed' ? 'var(--accent-red)' : 'var(--accent-amber)', border: `1px solid ${t.status === 'success' ? 'rgba(0,255,135,0.2)' : t.status === 'failed' ? 'rgba(255,59,59,0.2)' : 'rgba(255,184,0,0.2)'}` }}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
