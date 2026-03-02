import React, { useState } from 'react';
import { Send, Bell, Tag, Users, Megaphone, CheckCircle } from 'lucide-react';

const PAST_ANNOUNCEMENTS = [
  { id: 1, title: 'Peak Hour Alert – 6PM Crowd Warning', msg: 'Gym is at 90% capacity right now. We recommend visiting after 9PM or booking a slot.', audience: 'All Members', type: 'alert', time: '2h ago', reach: 1248 },
  { id: 2, title: 'New Year Offer – 30% Off Annual Plans', msg: 'Celebrate the new year with a 30% discount on all annual plan upgrades. Valid till Jan 31.', audience: 'Basic Members', type: 'offer', time: '1d ago', reach: 480 },
  { id: 3, title: 'New Group Class: HIIT Bootcamp', msg: 'We are launching a new HIIT Bootcamp class every Saturday at 7AM. Limited slots!', audience: 'Premium Members', type: 'update', time: '3d ago', reach: 520 },
  { id: 4, title: 'Scheduled Maintenance – Jan 30', msg: 'The swimming pool will be closed for maintenance on Jan 30 from 8AM–12PM.', audience: 'All Members', type: 'maintenance', time: '5d ago', reach: 1248 },
];

const typeColors = { alert: 'var(--accent-red)', offer: 'var(--accent-lime)', update: 'var(--accent-cyan)', maintenance: 'var(--accent-amber)' };
const typeIcons = { alert: '⚠', offer: '🎁', update: '📢', maintenance: '🔧' };

export default function AnnouncementPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Members');
  const [type, setType] = useState('update');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title || !message) return;
    setSent(true);
    setTitle(''); setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ADMIN · COMMUNICATIONS</div>
        <h1 className="page-title">ANNOUNCEMENTS</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Compose */}
        <div className="card" style={{ border: '1px solid rgba(200,255,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontWeight: 700, fontSize: 15 }}>
            <Megaphone size={16} color="var(--accent-lime)" /> New Announcement
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['update', 'alert', 'offer', 'maintenance'].map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: type === t ? `${typeColors[t]}20` : 'var(--bg-elevated)', color: type === t ? typeColors[t] : 'var(--text-secondary)', border: `1px solid ${type === t ? typeColors[t] + '40' : 'transparent'}`, transition: 'all 0.2s' }}>
                  {typeIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}>
              <option>All Members</option>
              <option>Basic Members</option>
              <option>Premium Members</option>
              <option>Student Members</option>
              <option>Annual Members</option>
              <option>Inactive Members</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter announcement title..." />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." rows={5}
              style={{ resize: 'vertical', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', width: '100%', outline: 'none' }} />
          </div>

          {/* Preview */}
          {(title || message) && (
            <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${typeColors[type]}25`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>Preview</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${typeColors[type]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{typeIcons[type]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title || 'Announcement Title'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message || 'Your message...'}</div>
                </div>
              </div>
            </div>
          )}

          {sent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(200,255,0,0.1)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: 8, color: 'var(--accent-lime)', fontWeight: 700, fontSize: 14 }}>
              <CheckCircle size={16} /> Announcement sent to {audience}!
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSend}>
              <Send size={16} /> Send Announcement
            </button>
          )}
        </div>

        {/* Past announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Announcements</div>
          {PAST_ANNOUNCEMENTS.map(a => {
            const color = typeColors[a.type];
            return (
              <div key={a.id} className="card" style={{ border: `1px solid ${color}20`, padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{typeIcons[a.type]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{a.msg}</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}><Users size={10} /> {a.audience}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}><Bell size={10} /> {a.reach} reached</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{a.time}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
