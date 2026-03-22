import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Search, Users, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const PLAN_COLORS = { BASIC: '#9090b0', PREMIUM: '#00ff87', STUDENT: '#ffd166', ANNUAL: '#00d4ff' };

export default function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [updating, setUpdating] = useState(null);
  const [success, setSuccess] = useState('');
  const limit = 10;

  useEffect(() => { loadMembers(); }, [page, planFilter]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getMembers({ page, limit, plan: planFilter || undefined, search: search || undefined });
      setMembers(data.data);
      setTotal(data.pagination.total);
    } catch { } finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadMembers(); };

  const updateMember = async (id, updates) => {
    setUpdating(id);
    try {
      await adminAPI.updateMember(id, updates);
      setSuccess('Member updated.');
      loadMembers();
      setTimeout(() => setSuccess(''), 2000);
    } catch { } finally { setUpdating(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">MANAGE MEMBERS</h1>
        <p className="page-subtitle">{total} total members</p>
      </div>

      {success && <div style={{ padding: '10px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12 }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ paddingLeft: 36 }} />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 14 }}>
          <option value="">All Plans</option>
          <option value="BASIC">Basic</option>
          <option value="PREMIUM">Premium</option>
          <option value="STUDENT">Student</option>
          <option value="ANNUAL">Annual</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 }}>
            <Loader size={24} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div>No members found</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Workouts</th>
                <th>Visits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</div>
                  </td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${PLAN_COLORS[m.plan]}15`, color: PLAN_COLORS[m.plan] }}>
                      {m.plan}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m._count?.workoutLogs || 0}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m._count?.attendanceLogs || 0}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: m.isActive ? 'rgba(0,255,135,0.1)' : 'rgba(255,59,59,0.1)', color: m.isActive ? '#00ff87' : '#ff3b3b' }}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select value={m.plan} onChange={e => updateMember(m.id, { plan: e.target.value })} disabled={updating === m.id}
                        style={{ padding: '4px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12 }}>
                        <option value="BASIC">Basic</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="STUDENT">Student</option>
                        <option value="ANNUAL">Annual</option>
                      </select>
                      <button onClick={() => updateMember(m.id, { isActive: !m.isActive })} disabled={updating === m.id}
                        className={`btn btn-sm ${m.isActive ? 'btn-danger' : 'btn-secondary'}`}>
                        {updating === m.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : m.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {totalPages} · {total} members</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={14} /></button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
