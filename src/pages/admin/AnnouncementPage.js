import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Plus, Trash2, Loader, Megaphone } from 'lucide-react';

const TYPE_CONFIG = {
  alert:       { color: '#ff3b3b', bg: 'rgba(255,59,59,0.1)',   label: 'Alert' },
  offer:       { color: '#00ff87', bg: 'rgba(0,255,135,0.1)',   label: 'Offer' },
  update:      { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   label: 'Update' },
  maintenance: { color: '#ffd166', bg: 'rgba(255,209,102,0.1)', label: 'Maintenance' },
};

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess]   = useState('');
  const [form, setForm] = useState({ title: '', message: '', type: 'update', audience: 'All Members' });

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAnnouncements();
      setAnnouncements(data.data);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createAnnouncement(form);
      setSuccess('Announcement created and broadcast to all connected users!');
      setShowForm(false);
      setForm({ title: '', message: '', type: 'update', audience: 'All Members' });
      loadAnnouncements();
      setTimeout(() => setSuccess(''), 4000);
    } catch { } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await adminAPI.deleteAnnouncement(id);
      setAnnouncements(a => a.filter(x => x.id !== id));
    } catch { }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">ANNOUNCEMENTS</h1>
          <p className="page-subtitle">Broadcast messages to all members via Socket.IO</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>NEW ANNOUNCEMENT</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title..." required />
            </div>
            <div>
              <label className="form-label">Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your message..." required rows={3}
                style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 14, width: '100%', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="form-label">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="update">Update</option>
                  <option value="alert">Alert</option>
                  <option value="offer">Offer</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="form-label">Audience</label>
                <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                  <option value="All Members">All Members</option>
                  <option value="Premium Members">Premium Members</option>
                  <option value="Basic Members">Basic Members</option>
                  <option value="Student Members">Student Members</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
              {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Broadcasting...</> : <><Megaphone size={16} /> Broadcast Now</>}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Loader size={24} color="var(--accent-lime)" style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : announcements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Megaphone size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--text-secondary)' }}>No announcements yet. Create one to broadcast to all members.</div>
          </div>
        ) : announcements.map(a => {
          const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.update;
          return (
            <div key={a.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.audience}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {a.reach} reached</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginLeft: 16 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
