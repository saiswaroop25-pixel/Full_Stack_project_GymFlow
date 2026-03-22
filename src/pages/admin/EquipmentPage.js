import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Wrench, CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react';

const STATUS_CONFIG = {
  OPERATIONAL:   { color: '#00ff87', icon: CheckCircle,    label: 'Operational' },
  MAINTENANCE:   { color: '#ffd166', icon: AlertTriangle,  label: 'Maintenance' },
  OUT_OF_SERVICE:{ color: '#ff3b3b', icon: XCircle,        label: 'Out of Service' },
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [summary, setSummary]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);
  const [filter, setFilter]       = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => { loadEquipment(); }, [filter]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getEquipment({ status: filter || undefined });
      setEquipment(data.data);
      setSummary(data.summary);
    } catch { } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminAPI.updateEquipment(id, { status });
      setSuccess('Equipment updated.');
      loadEquipment();
      setTimeout(() => setSuccess(''), 2000);
    } catch { } finally { setUpdating(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">EQUIPMENT</h1>
        <p className="page-subtitle">Monitor and manage gym equipment</p>
      </div>

      {success && <div style={{ padding: '10px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total',        value: summary.total,       color: '#00d4ff' },
          { label: 'Operational',  value: summary.operational, color: '#00ff87' },
          { label: 'Maintenance',  value: summary.maintenance, color: '#ffd166' },
          { label: 'Out of Service',value: summary.outOfService,color: '#ff3b3b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color }}>{value || 0}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['', 'OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s === '' ? 'All' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Equipment list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 }}>
            <Loader size={24} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Type</th>
                <th>Usage Rate</th>
                <th>Status</th>
                <th>Next Maintenance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(eq => {
                const cfg = STATUS_CONFIG[eq.status];
                const Icon = cfg.icon;
                return (
                  <tr key={eq.id}>
                    <td style={{ fontWeight: 600 }}>{eq.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{eq.type}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                          <div style={{ width: `${eq.usageRate}%`, height: '100%', background: eq.usageRate > 80 ? '#ff3b3b' : eq.usageRate > 60 ? '#ffd166' : '#00ff87', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{eq.usageRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} color={cfg.color} />
                        <span style={{ fontSize: 13, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {eq.nextMaintDate ? new Date(eq.nextMaintDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td>
                      <select value={eq.status} onChange={e => updateStatus(eq.id, e.target.value)} disabled={updating === eq.id}
                        style={{ padding: '4px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12 }}>
                        <option value="OPERATIONAL">Operational</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
