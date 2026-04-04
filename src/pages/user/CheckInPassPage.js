import React, { useEffect, useState } from 'react';
import { authAPI, crowdAPI } from '../../api';
import { Loader, QrCode, LogIn, LogOut } from 'lucide-react';

export default function CheckInPassPage() {
  const [pass, setPass] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadPass = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.getCheckInPass();
      setPass(data.data);
    } catch {
      setError('Failed to load your check-in pass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPass();
  }, []);

  const submit = async (action) => {
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const { data } = action === 'checkin' ? await crowdAPI.checkIn() : await crowdAPI.checkOut();
      setMessage(data.message || `Successfully completed ${action}.`);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action}.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">CHECK-IN PASS</h1>
        <p className="page-subtitle">Use this pass for front-desk scan or self-service attendance actions.</p>
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,59,59,0.1)', color: '#ff6b6b' }}>{error}</div>}
      {message && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(0,255,135,0.1)', color: '#00ff87' }}>{message}</div>}

      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <QrCode size={42} style={{ margin: '0 auto 16px', color: 'var(--accent-lime)' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 10 }}>{pass?.member?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Issued {pass?.issuedAt}</div>
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-elevated)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {pass?.token}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => submit('checkin')} disabled={submitting}><LogIn size={14} /> Check In</button>
        <button className="btn btn-secondary" onClick={() => submit('checkout')} disabled={submitting}><LogOut size={14} /> Check Out</button>
      </div>
    </div>
  );
}
