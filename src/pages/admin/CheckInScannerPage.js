import React, { useState } from 'react';
import { adminAPI } from '../../api';
import { ScanLine } from 'lucide-react';

export default function CheckInScannerPage() {
  const [token, setToken] = useState('');
  const [action, setAction] = useState('checkin');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const { data } = await adminAPI.scanCheckInPass({ token, action });
      setResult(data.data);
      setMessage(data.message);
      setToken('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan pass.');
    }
  };

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">CHECK-IN SCANNER</h1>
        <p className="page-subtitle">Paste a pass token to simulate front-desk scanning.</p>
      </div>

      {message && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(0,255,135,0.1)', color: '#00ff87' }}>{message}</div>}
      {error && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,59,59,0.1)', color: '#ff6b6b' }}>{error}</div>}

      <form className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScanLine size={16} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Scan Member Pass</div>
        </div>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="checkin">Check In</option>
          <option value="checkout">Check Out</option>
        </select>
        <textarea rows={5} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the user's pass token here..." />
        <button className="btn btn-primary" type="submit">Process Scan</button>
      </form>

      {result && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>Latest Result</div>
          <div style={{ fontSize: 14 }}>{result.member?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{result.member?.email}</div>
          <div style={{ marginTop: 10, color: 'var(--text-muted)' }}>{result.action}</div>
        </div>
      )}
    </div>
  );
}
