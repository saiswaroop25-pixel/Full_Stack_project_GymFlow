import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Tool, Plus, Settings } from 'lucide-react';

const EQUIPMENT = [
  { id: 1, name: 'Treadmill #1', type: 'Cardio', usage: 92, status: 'operational', lastMaint: '2024-01-15', nextMaint: '2024-02-15', age: '2 years' },
  { id: 2, name: 'Treadmill #2', type: 'Cardio', usage: 78, status: 'operational', lastMaint: '2024-01-10', nextMaint: '2024-02-10', age: '2 years' },
  { id: 3, name: 'Treadmill #3', type: 'Cardio', usage: 0, status: 'maintenance', lastMaint: '2023-12-20', nextMaint: '2024-01-30', age: '3 years' },
  { id: 4, name: 'Squat Rack A', type: 'Strength', usage: 85, status: 'operational', lastMaint: '2024-01-20', nextMaint: '2024-03-20', age: '1 year' },
  { id: 5, name: 'Squat Rack B', type: 'Strength', usage: 72, status: 'operational', lastMaint: '2024-01-20', nextMaint: '2024-03-20', age: '1 year' },
  { id: 6, name: 'Bench Press A', type: 'Strength', usage: 88, status: 'operational', lastMaint: '2024-01-18', nextMaint: '2024-03-18', age: '4 years' },
  { id: 7, name: 'Bench Press B', type: 'Strength', usage: 0, status: 'maintenance', lastMaint: '2024-01-05', nextMaint: '2024-01-28', age: '4 years' },
  { id: 8, name: 'Leg Press 1', type: 'Strength', usage: 65, status: 'operational', lastMaint: '2024-01-22', nextMaint: '2024-04-22', age: '2 years' },
  { id: 9, name: 'Cable Machine', type: 'Functional', usage: 74, status: 'operational', lastMaint: '2024-01-25', nextMaint: '2024-04-25', age: '1 year' },
  { id: 10, name: 'Rowing Machine', type: 'Cardio', usage: 48, status: 'operational', lastMaint: '2024-01-12', nextMaint: '2024-02-12', age: '3 years' },
  { id: 11, name: 'Spin Bike #1', type: 'Cardio', usage: 60, status: 'operational', lastMaint: '2024-01-14', nextMaint: '2024-02-14', age: '2 years' },
  { id: 12, name: 'Smith Machine', type: 'Strength', usage: 55, status: 'low_usage', lastMaint: '2024-01-08', nextMaint: '2024-02-08', age: '5 years' },
];

const typeColors = { Cardio: 'var(--accent-cyan)', Strength: 'var(--accent-purple)', Functional: 'var(--accent-amber)' };

export default function EquipmentPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = EQUIPMENT.filter(e => filter === 'All' || e.type === filter || e.status === filter);
  const operational = EQUIPMENT.filter(e => e.status === 'operational').length;
  const maintenance = EQUIPMENT.filter(e => e.status === 'maintenance').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · EQUIPMENT</div>
          <h1 className="page-title">EQUIPMENT <span style={{ color: 'var(--accent-orange)' }}>STATUS</span></h1>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add Equipment</button>
      </div>

      {/* Summary */}
      <div className="grid-4">
        {[
          { label: 'Total Equipment', value: EQUIPMENT.length, color: 'var(--accent-blue)' },
          { label: 'Operational', value: operational, color: 'var(--accent-green)' },
          { label: 'In Maintenance', value: maintenance, color: 'var(--accent-red)' },
          { label: 'Avg Usage Rate', value: `${Math.round(EQUIPMENT.reduce((a, e) => a + e.usage, 0) / EQUIPMENT.length)}%`, color: 'var(--accent-amber)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Maintenance alert */}
      {maintenance > 0 && (
        <div style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertTriangle size={18} color="var(--accent-red)" />
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-red)' }}>{maintenance} machines in maintenance</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>Schedule service to restore capacity.</span>
          </div>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>Schedule Service</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Cardio', 'Strength', 'Functional', 'maintenance'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: filter === f ? 'var(--accent-lime)' : 'var(--bg-elevated)', color: filter === f ? '#000' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s' }}>
            {f === 'maintenance' ? '⚠ Maintenance' : f}
          </button>
        ))}
      </div>

      {/* Equipment grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(eq => {
          const statusColor = eq.status === 'operational' ? 'var(--accent-green)' : eq.status === 'maintenance' ? 'var(--accent-red)' : 'var(--accent-amber)';
          const typeColor = typeColors[eq.type] || 'var(--accent-blue)';
          return (
            <div key={eq.id} className="card" onClick={() => setSelected(selected?.id === eq.id ? null : eq)}
              style={{ cursor: 'pointer', border: `1px solid ${selected?.id === eq.id ? 'rgba(200,255,0,0.3)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{eq.name}</div>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>{eq.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {eq.status === 'operational' ? <CheckCircle size={16} color="var(--accent-green)" /> : <AlertTriangle size={16} color={statusColor} />}
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>
                    {eq.status === 'operational' ? 'OK' : eq.status === 'maintenance' ? 'MAINT' : 'LOW'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usage Rate</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: eq.usage > 80 ? 'var(--accent-red)' : eq.usage > 50 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>{eq.usage}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${eq.usage}%`, height: '100%', background: eq.usage > 80 ? 'var(--accent-red)' : eq.usage > 50 ? 'var(--accent-amber)' : 'var(--accent-green)', borderRadius: 100 }} />
                </div>
              </div>

              {selected?.id === eq.id && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, animation: 'fade-up 0.2s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Age</span>
                    <span>{eq.age}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Last Maintenance</span>
                    <span>{eq.lastMaint}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Next Due</span>
                    <span style={{ color: 'var(--accent-amber)' }}>{eq.nextMaint}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 8, justifyContent: 'center' }}>
                    <Settings size={12} /> Schedule Maintenance
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
