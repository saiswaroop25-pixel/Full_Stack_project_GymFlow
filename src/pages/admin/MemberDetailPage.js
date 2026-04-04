import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../api';
import { ArrowLeft, Loader, MessageSquare } from 'lucide-react';

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: memberRes }, { data: timelineRes }] = await Promise.all([
        adminAPI.getMember(id),
        adminAPI.getMemberTimeline(id),
      ]);
      setMember(memberRes.data);
      setTimeline(timelineRes.data || []);
    } catch {
      setError('Failed to load member detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      await adminAPI.addMemberNote(id, { body: note });
      setNote('');
      load();
    } catch {
      setError('Failed to add note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  if (!member) {
    return <div style={{ padding: 24, color: '#ff3b3b' }}>{error || 'Member not found.'}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/members')}><ArrowLeft size={14} /> Back</button>
          <h1 className="page-title" style={{ marginTop: 12 }}>{member.name}</h1>
          <p className="page-subtitle">{member.email} · {member.plan} · {member.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,59,59,0.1)', color: '#ff6b6b' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Workouts', value: member._count?.workoutLogs || member.workoutLogs?.length || 0 },
          { label: 'Visits', value: member._count?.attendanceLogs || member.attendanceLogs?.length || 0 },
          { label: 'Last Visit', value: member.crm?.lastVisit ? new Date(member.crm.lastVisit).toLocaleDateString('en-IN') : 'None' },
          { label: 'Recent Payment', value: member.crm?.recentPayment ? `Rs ${member.crm.recentPayment.amount}` : 'No payment' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {timeline.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No recent activity.</div> : timeline.map((item) => (
              <div key={item.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{new Date(item.date).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <MessageSquare size={16} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>CRM Notes</div>
          </div>
          <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a follow-up note, coaching reminder, or member concern..." style={{ width: '100%' }} />
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Note'}</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(member.crm?.notes || []).map((item) => (
              <div key={item.id} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.author} · {new Date(item.createdAt).toLocaleString('en-IN')}</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>{item.body}</div>
              </div>
            ))}
            {(!member.crm?.notes || member.crm.notes.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No notes yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
