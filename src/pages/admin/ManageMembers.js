import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, CheckCircle, XCircle, UserCheck } from 'lucide-react';

const MEMBERS = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun@gmail.com', plan: 'Premium', joined: 'Jan 28, 2024', status: 'active', visits: 42, lastVisit: '2h ago' },
  { id: 2, name: 'Priya Sharma', email: 'priya@gmail.com', plan: 'Basic', joined: 'Jan 27, 2024', status: 'active', visits: 18, lastVisit: '1d ago' },
  { id: 3, name: 'Rohan Verma', email: 'rohan@gmail.com', plan: 'Premium', joined: 'Jan 25, 2024', status: 'active', visits: 31, lastVisit: '3h ago' },
  { id: 4, name: 'Ananya Singh', email: 'ananya@gmail.com', plan: 'Student', joined: 'Jan 24, 2024', status: 'inactive', visits: 5, lastVisit: '12d ago' },
  { id: 5, name: 'Vikram Nair', email: 'vikram@gmail.com', plan: 'Annual', joined: 'Jan 22, 2024', status: 'active', visits: 58, lastVisit: '1h ago' },
  { id: 6, name: 'Deepika Rao', email: 'deepika@gmail.com', plan: 'Basic', joined: 'Jan 20, 2024', status: 'active', visits: 22, lastVisit: '2d ago' },
  { id: 7, name: 'Kiran Patel', email: 'kiran@gmail.com', plan: 'Premium', joined: 'Jan 18, 2024', status: 'active', visits: 47, lastVisit: '5h ago' },
  { id: 8, name: 'Sneha Gupta', email: 'sneha@gmail.com', plan: 'Student', joined: 'Jan 15, 2024', status: 'inactive', visits: 3, lastVisit: '21d ago' },
  { id: 9, name: 'Rahul Bose', email: 'rahul@gmail.com', plan: 'Annual', joined: 'Jan 10, 2024', status: 'active', visits: 72, lastVisit: '30m ago' },
  { id: 10, name: 'Meera Iyer', email: 'meera@gmail.com', plan: 'Basic', joined: 'Jan 5, 2024', status: 'active', visits: 29, lastVisit: '1d ago' },
];

const planColors = { Premium: 'var(--accent-purple)', Basic: 'var(--accent-blue)', Student: 'var(--accent-cyan)', Annual: 'var(--accent-lime)' };

export default function ManageMembers() {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'All' || m.plan === filterPlan;
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · MEMBERS</div>
          <h1 className="page-title">MANAGE <span style={{ color: 'var(--accent-orange)' }}>MEMBERS</span></h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid-4">
        {[
          { label: 'Total Members', value: '1,248', color: 'var(--accent-blue)' },
          { label: 'Active Members', value: '1,024', color: 'var(--accent-green)' },
          { label: 'Inactive', value: '224', color: 'var(--accent-red)' },
          { label: 'New This Month', value: '142', color: 'var(--accent-purple)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add member panel */}
      {showAdd && (
        <div className="card" style={{ border: '1px solid rgba(200,255,0,0.2)', animation: 'fade-up 0.3s ease' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--accent-lime)' }}>+ Add New Member</div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div><label className="form-label">Full Name</label><input type="text" placeholder="Enter name" /></div>
            <div><label className="form-label">Email Address</label><input type="email" placeholder="Enter email" /></div>
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <label className="form-label">Plan</label>
              <select><option>Basic</option><option>Premium</option><option>Student</option><option>Annual</option></select>
            </div>
            <div><label className="form-label">Phone Number</label><input type="text" placeholder="+91" /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary">Create Member</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Basic', 'Premium', 'Student', 'Annual'].map(p => (
              <button key={p} onClick={() => setFilterPlan(p)}
                style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: filterPlan === p ? 'var(--accent-lime)' : 'var(--bg-elevated)', color: filterPlan === p ? '#000' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s' }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'active', 'inactive'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: filterStatus === s ? 'var(--bg-elevated)' : 'transparent', color: filterStatus === s ? 'var(--text-primary)' : 'var(--text-muted)', border: `1px solid ${filterStatus === s ? 'var(--border-medium)' : 'transparent'}`, transition: 'all 0.2s' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th><th>Plan</th><th>Status</th><th>Visits</th><th>Last Visit</th><th>Joined</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${planColors[m.plan]}25`, border: `1px solid ${planColors[m.plan]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: planColors[m.plan] }}>
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${planColors[m.plan]}15`, color: planColors[m.plan] }}>{m.plan}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.status === 'active'
                      ? <><CheckCircle size={13} color="var(--accent-green)" /><span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>Active</span></>
                      : <><XCircle size={13} color="var(--accent-red)" /><span style={{ fontSize: 13, color: 'var(--accent-red)', fontWeight: 600 }}>Inactive</span></>}
                  </div>
                </td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{m.visits}</span></td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.lastVisit}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.joined}</td>
                <td>
                  <button className="btn btn-ghost btn-sm btn-icon"><MoreVertical size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Showing {filtered.length} of {MEMBERS.length} members</div>
    </div>
  );
}
