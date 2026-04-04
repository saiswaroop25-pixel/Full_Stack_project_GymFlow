import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authAPI, subscriptionAPI } from '../../api';
import { User, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const GOALS = [
  { value: 'MUSCLE_GAIN',     label: 'Muscle Gain' },
  { value: 'FAT_LOSS',        label: 'Fat Loss' },
  { value: 'STRENGTH',        label: 'Strength' },
  { value: 'ENDURANCE',       label: 'Endurance' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
];

const PLAN_COLORS = { BASIC: '#9090b0', PREMIUM: '#00ff87', STUDENT: '#ffd166', ANNUAL: '#00d4ff' };

export default function ProfilePage() {
  const { user, updateUser } = useApp();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);

  const [form, setForm] = useState({
    name:         user?.name         || '',
    goal:         user?.goal         || 'GENERAL_FITNESS',
    height:       user?.height       || '',
    weight:       user?.weight       || '',
    targetWeight: user?.targetWeight || '',
    phone:        user?.phone        || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const [{ data: subRes }, { data: plansRes }] = await Promise.all([
          subscriptionAPI.getMySubscription(),
          subscriptionAPI.getPlans(),
        ]);
        setSubscription(subRes.data);
        setPlans(plansRes.data.plans || []);
      } catch (_) {
        // keep profile page usable even if subscription panel fails
      }
    };
    loadSubscription();
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setError('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setSavingPw(true);
    setError('');
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const planColor = PLAN_COLORS[user?.plan] || '#9090b0';
  const initials  = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const changePlan = async (plan) => {
    setSubscriptionBusy(true);
    setError('');
    try {
      const { data } = await subscriptionAPI.checkout({ plan });
      setSubscription((current) => ({ ...(current || {}), subscription: data.data.subscription, payments: [data.data.payment, ...((current?.payments) || [])] }));
      updateUser({ ...user, plan: data.data.user.plan });
      setSuccess(`${plan} plan activated.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change plan.');
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const cancelPlan = async () => {
    setSubscriptionBusy(true);
    setError('');
    try {
      const { data } = await subscriptionAPI.cancel();
      setSubscription((current) => ({ ...(current || {}), subscription: data.data }));
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule cancellation.');
    } finally {
      setSubscriptionBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
      <div>
        <h1 className="page-title">PROFILE</h1>
        <p className="page-subtitle">Manage your account and fitness settings</p>
      </div>

      {error   && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}><AlertCircle size={16} />{error}</div>}
      {success && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}><CheckCircle size={16} />{success}</div>}

      {/* Avatar + plan */}
      <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-elevated)', border: `2px solid ${planColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, color: planColor, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${planColor}15`, color: planColor, border: `1px solid ${planColor}30` }}>
              {user?.plan} PLAN
            </span>
            {user?.role === 'ADMIN' && (
              <span style={{ padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
                ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>SUBSCRIPTION</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Current status: <span style={{ color: planColor, fontWeight: 700 }}>{subscription?.subscription?.plan || user?.plan}</span>
          {subscription?.subscription?.cancelAtPeriodEnd ? ' · Cancels at period end' : ''}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {plans.map((plan) => (
            <button key={plan.code} type="button" className="btn btn-secondary" disabled={subscriptionBusy || user?.plan === plan.code} onClick={() => changePlan(plan.code)} style={{ justifyContent: 'space-between' }}>
              <span>{plan.code}</span>
              <span>Rs {plan.price}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={cancelPlan} disabled={subscriptionBusy}>Schedule Cancellation</button>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>PERSONAL INFO</div>
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="form-label">Fitness Goal</label>
            <select name="goal" value={form.goal} onChange={handleChange}>
              {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="178" />
            </div>
            <div>
              <label className="form-label">Current Weight (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="75" />
            </div>
            <div>
              <label className="form-label">Target Weight (kg)</label>
              <input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} placeholder="80" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
            {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>CHANGE PASSWORD</div>
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required placeholder="••••••••" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} disabled={savingPw}>
            {savingPw ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>ACCOUNT INFO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
            { label: 'Email',        value: user?.email },
            { label: 'Role',         value: user?.role },
            { label: 'Plan',         value: user?.plan },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
