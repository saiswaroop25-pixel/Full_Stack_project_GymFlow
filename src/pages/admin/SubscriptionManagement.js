import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Loader, DollarSign } from 'lucide-react';

const PLAN_CONFIG = {
  BASIC:   { color: '#9090b0', price: 299,  features: ['Gym Access', 'Basic Analytics', 'Slot Booking'] },
  PREMIUM: { color: '#00ff87', price: 599,  features: ['All Basic', 'AI Insights', 'Priority Slots', 'Diet Tracker'] },
  STUDENT: { color: '#ffd166', price: 199,  features: ['Gym Access', 'Basic Analytics', 'Student Discount'] },
  ANNUAL:  { color: '#00d4ff', price: 4999, features: ['All Premium', 'Annual Savings', 'Exclusive Events'] },
};

export default function SubscriptionManagement() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await adminAPI.getDashboard();
        setData(res.data);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
      <Loader size={28} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const { stats, planDistribution } = data;

  const totalRevenue = planDistribution?.reduce((acc, p) => {
    const price = PLAN_CONFIG[p.plan]?.price || 0;
    return acc + price * p.count;
  }, 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">SUBSCRIPTIONS</h1>
        <p className="page-subtitle">Membership plans and revenue overview</p>
      </div>

      {/* Revenue summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Members',    value: stats.totalMembers,                   color: '#00d4ff' },
          { label: 'Monthly Revenue',  value: `₹${totalRevenue.toLocaleString()}`, color: '#00ff87' },
          { label: 'Active Members',   value: stats.activeMembers,                  color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 24, textAlign: 'center' }}>
            <DollarSign size={24} color={color} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {planDistribution?.map(({ plan, count }) => {
          const cfg      = PLAN_CONFIG[plan] || {};
          const revenue  = (cfg.price || 0) * count;
          const pct      = Math.round((count / stats.totalMembers) * 100);

          return (
            <div key={plan} className="card" style={{ padding: 24, border: `1px solid ${cfg.color}20` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: cfg.color }}>{plan}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>₹{cfg.price}/month</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: cfg.color }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>members</div>
                </div>
              </div>

              {/* Revenue bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>{pct}% of members</span>
                  <span style={{ color: cfg.color, fontWeight: 700 }}>₹{revenue.toLocaleString()}/mo</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cfg.features?.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
