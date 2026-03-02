import React, { useState } from 'react';
import { Calendar, Check, Plus, RefreshCw, Clock } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── CalendarSyncPage ────────────────────────────────────────────────────────
export function CalendarSyncPage() {
  const [connected, setConnected] = useState(false);
  const [slots, setSlots] = useState([
    { time: '6:00 AM – 7:30 AM', day: 'Mon, Mar 3', crowd: 28, booked: false },
    { time: '12:00 PM – 1:00 PM', day: 'Tue, Mar 4', crowd: 42, booked: false },
    { time: '7:00 PM – 8:30 PM', day: 'Wed, Mar 5', crowd: 88, booked: false },
    { time: '6:00 AM – 7:30 AM', day: 'Thu, Mar 6', crowd: 30, booked: true },
    { time: '5:30 PM – 7:00 PM', day: 'Fri, Mar 7', crowd: 65, booked: false },
    { time: '9:00 AM – 10:30 AM', day: 'Sat, Mar 8', crowd: 35, booked: false },
  ]);

  const book = (i) => setSlots(s => s.map((sl, idx) => idx === i ? { ...sl, booked: !sl.booked } : sl));
  const crowdColor = (v) => v < 50 ? 'var(--accent-green)' : v < 70 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div>
        <h1 className="page-title">CALENDAR <span style={{ color: 'var(--accent-purple)' }}>SYNC</span></h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Let GymFlow find your perfect workout window.</p>
      </div>

      {!connected ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', background: 'linear-gradient(135deg, rgba(168,85,247,0.08), transparent)' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Calendar size={40} color="var(--accent-purple)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>CONNECT GOOGLE CALENDAR</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
            We'll analyze your free slots and pair them with low-crowd gym windows for the perfect workout time.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setConnected(true)}>
            Connect Google Calendar
          </button>
        </div>
      ) : (
        <>
          <div className="card card-sm" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Check size={20} color="var(--accent-green)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Google Calendar Connected — arjun@gmail.com</span>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}><RefreshCw size={14} /> Sync</button>
            </div>
          </div>

          <div>
            <div className="section-title" style={{ marginBottom: 16 }}>Suggested Workout Windows (Next 7 Days)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {slots.map((slot, i) => (
                <div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16, border: slot.booked ? '1px solid rgba(0,255,135,0.3)' : '1px solid var(--border)', background: slot.booked ? 'rgba(0,255,135,0.04)' : 'var(--bg-card)' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} color="var(--text-secondary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{slot.day}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{slot.time}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: crowdColor(slot.crowd) }}>{slot.crowd}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>crowd</div>
                  </div>
                  <button className={`btn btn-sm ${slot.booked ? 'btn-secondary' : 'btn-primary'}`} onClick={() => book(i)}>
                    {slot.booked ? <><Check size={14} /> Booked</> : <><Plus size={14} /> Book</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ActivityMonitorPage ─────────────────────────────────────────────────────
export function ActivityMonitorPage() {
  const stepsData = [
    { time: '6AM', steps: 200 }, { time: '8AM', steps: 1200 }, { time: '10AM', steps: 2400 },
    { time: '12PM', steps: 4100 }, { time: '2PM', steps: 5600 }, { time: '4PM', steps: 6800 },
    { time: '6PM', steps: 7832 }, { time: '8PM', steps: 7832 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div>
        <h1 className="page-title">ACTIVITY <span style={{ color: 'var(--accent-blue)' }}>MONITOR</span></h1>
      </div>

      <div className="grid-3">
        {[
          { label: 'Steps', value: '7,832', goal: '10,000', pct: 78, color: 'var(--accent-blue)', unit: 'steps' },
          { label: 'Calories Burned', value: '412', goal: '600', pct: 69, color: 'var(--accent-orange)', unit: 'kcal' },
          { label: 'Active Minutes', value: '47', goal: '60', pct: 78, color: 'var(--accent-green)', unit: 'min' },
        ].map(({ label, value, goal, pct, color, unit }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 6px ${color}60)` }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color, lineHeight: 1 }}>{pct}%</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Goal: {goal} {unit}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>Steps Throughout the Day</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={stepsData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="steps" stroke="var(--accent-blue)" fill="url(#stepGrad)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card card-sm" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4 }}>Connect Wearable</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sync with Google Fit, Apple Health, or Garmin for automatic activity tracking.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['Google Fit', 'Apple Health', 'Garmin', 'Fitbit'].map(d => (
            <button key={d} className="btn btn-ghost btn-sm">{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GoalManagementPage ──────────────────────────────────────────────────────
export function GoalManagementPage() {
  const [goals] = useState([
    { id: 1, name: 'Target Weight', current: 75, target: 70, unit: 'kg', start: 78, deadline: 'Apr 30', color: 'var(--accent-green)' },
    { id: 2, name: 'Bench Press 1RM', current: 82, target: 100, unit: 'kg', start: 70, deadline: 'Jun 30', color: 'var(--accent-blue)' },
    { id: 3, name: 'Daily Steps', current: 7832, target: 10000, unit: 'steps', start: 5000, deadline: 'Ongoing', color: 'var(--accent-purple)' },
    { id: 4, name: 'Body Fat %', current: 18, target: 14, unit: '%', start: 22, deadline: 'May 15', color: 'var(--accent-orange)' },
  ]);

  const weightData = [
    { week: 'W1', w: 78 }, { week: 'W2', w: 77.2 }, { week: 'W3', w: 76.8 },
    { week: 'W4', w: 76.1 }, { week: 'W5', w: 75.5 }, { week: 'W6', w: 75 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <h1 className="page-title">GOAL <span style={{ color: 'var(--accent-yellow)' }}>MANAGER</span></h1>
        <button className="btn btn-primary btn-sm"><Plus size={16} /> New Goal</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {goals.map(goal => {
          const range = Math.abs(goal.target - goal.start);
          const progress = Math.abs(goal.current - goal.start) / range;
          const pct = Math.min(100, Math.round(progress * 100));
          return (
            <div key={goal.id} className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{goal.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deadline: {goal.deadline}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: goal.color }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>complete</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Start: <strong style={{ color: 'var(--text-primary)' }}>{goal.start} {goal.unit}</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Current: <strong style={{ color: goal.color }}>{goal.current} {goal.unit}</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Target: <strong style={{ color: 'var(--text-primary)' }}>{goal.target} {goal.unit}</strong></span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 100 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: goal.color, borderRadius: 100, boxShadow: `0 0 10px ${goal.color}50`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Weight Trend</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weightData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="kg" domain={[68, 80]} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="w" stroke="var(--accent-green)" strokeWidth={2.5} dot={{ fill: 'var(--accent-green)', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── SlotBookingPage ─────────────────────────────────────────────────────────
export function SlotBookingPage() {
  const [selected, setSelected] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  const days = ['Mon Mar 3', 'Tue Mar 4', 'Wed Mar 5', 'Thu Mar 6', 'Fri Mar 7'];
  const times = ['6:00 AM', '7:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  // Stable deterministic crowd values (no Math.random in render)
  const crowdValues = [35,55,72,28,88,42,60,38,65,48,78,32,90,44,58,70,25,82,50,67,40,85,55,30,75,46,92,38,62,48,80,35,70,52,88,28,65,45,78,33,95,50,72,40,85];
  const slotData = {};
  let idx = 0;
  days.forEach(d => { times.forEach(t => { slotData[`${d}-${t}`] = crowdValues[idx++ % crowdValues.length]; }); });

  const getColor = (v) => v < 50 ? 'var(--accent-green)' : v < 70 ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const book = () => { if (selected) { setBookedSlots(b => [...b, selected]); setSelected(null); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">SLOT <span style={{ color: 'var(--accent-green)' }}>BOOKING</span></h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Pick a low-crowd time. Reserve your spot.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ l: 'Low', c: 'var(--accent-green)' }, { l: 'Med', c: 'var(--accent-yellow)' }, { l: 'High', c: 'var(--accent-red)' }].map(s => (
            <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} /> {s.l}
            </span>
          ))}
        </div>
      </div>

      {bookedSlots.length > 0 && (
        <div className="card card-sm" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.2)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8 }}>Your Bookings</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {bookedSlots.map(s => <span key={s} className="badge badge-green">{s}</span>)}
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'left', padding: '0 0 12px 4px', fontWeight: 700 }}>Time</th>
              {days.map(d => (
                <th key={d} style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: '0 0 12px', fontWeight: 700 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(t => (
              <tr key={t}>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t}</td>
                {days.map(d => {
                  const key = `${d}-${t}`;
                  const c = slotData[key];
                  const color = getColor(c);
                  const isBooked = bookedSlots.includes(key);
                  const isSel = selected === key;
                  return (
                    <td key={d} onClick={() => !isBooked && setSelected(isSel ? null : key)}
                      style={{ padding: 4, textAlign: 'center', cursor: isBooked ? 'default' : 'pointer' }}>
                      <div style={{ padding: '6px 8px', borderRadius: 6, background: isBooked ? 'rgba(0,255,135,0.1)' : isSel ? `${color}25` : `${color}10`, border: `1px solid ${isBooked ? 'rgba(0,255,135,0.4)' : isSel ? color : `${color}30`}`, fontSize: 11, fontWeight: 700, color: isBooked ? 'var(--accent-green)' : color, transition: 'all 0.15s' }}>
                        {isBooked ? '✓' : `${c}%`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card card-sm" style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.3)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, fontSize: 14 }}>
            Selected: <strong>{selected}</strong> — {slotData[selected]}% crowd expected
          </div>
          <button className="btn btn-primary btn-sm" onClick={book}>Confirm Booking</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ─── NotificationsPage ───────────────────────────────────────────────────────
export function NotificationsPage() {
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Gym quieting down!', body: 'Occupancy dropped to 38%. Great time to head in.', time: '2 min ago', read: false, color: 'var(--accent-green)' },
    { id: 2, title: 'Slot Confirmed', body: 'Your slot for Thursday 6:00 AM has been confirmed.', time: '1 hr ago', read: false, color: 'var(--accent-blue)' },
    { id: 3, title: 'New Personal Record!', body: 'You hit a new PR on Deadlift: 140 kg!', time: '3 hrs ago', read: false, color: 'var(--accent-yellow)' },
    { id: 4, title: 'Protein Goal Reached', body: "You've hit your 180g protein goal for today. Great job!", time: '5 hrs ago', read: true, color: 'var(--accent-orange)' },
    { id: 5, title: 'Peak Hour Alert', body: 'Gym is at 88% capacity. Consider coming after 9 PM.', time: 'Yesterday', read: true, color: 'var(--accent-red)' },
    { id: 6, title: 'Workout Reminder', body: "You haven't logged a workout in 2 days. Stay consistent!", time: 'Yesterday', read: true, color: 'var(--accent-purple)' },
  ]);

  const markRead = (id) => setNotifs(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <div>
          <h1 className="page-title">NOTIFICATIONS</h1>
          {unread > 0 && <span className="badge badge-orange" style={{ marginTop: 8 }}>{unread} unread</span>}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setNotifs(n => n.map(notif => ({ ...notif, read: true })))}>
          Mark all read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifs.map(n => (
          <div key={n.id} className="card card-sm"
            style={{ display: 'flex', gap: 16, opacity: n.read ? 0.6 : 1, cursor: 'pointer', border: `1px solid ${n.read ? 'var(--border)' : `${n.color}30`}`, background: n.read ? 'var(--bg-card)' : `${n.color}05` }}
            onClick={() => markRead(n.id)}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${n.color}15`, border: `1px solid ${n.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                {n.title}
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.color }} />}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ProfilePage ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: 'Arjun Sharma', email: 'arjun@example.com', goal: 'Muscle Gain', height: 178, weight: 75 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.5s ease' }}>
      <div className="flex-between">
        <h1 className="page-title">MY <span style={{ color: 'var(--accent-green)' }}>PROFILE</span></h1>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing(!editing)}>
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 96, height: 96, background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#000' }}>
            AS
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{form.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{form.email}</div>
          </div>
          <span className="badge badge-green">Pro Member</span>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ label: 'Member Since', value: 'Jan 2024' }, { label: 'Workouts Logged', value: '87' }, { label: 'Streak', value: '8 days' }].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Personal Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Fitness Goal', key: 'goal', type: 'text' }].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
                  {editing
                    ? <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    : <div style={{ padding: '12px 0', fontSize: 14, fontWeight: 600 }}>{form[key]}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Body Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ label: 'Height (cm)', key: 'height' }, { label: 'Weight (kg)', key: 'weight' }].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
                  {editing
                    ? <input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    : <div style={{ padding: '12px 0', fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--accent-green)' }}>{form[key]}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Subscription Plan</div>
            <div style={{ padding: 20, background: 'linear-gradient(135deg, rgba(0,255,135,0.08), transparent)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-green)' }}>Pro Plan</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rs. 599 / month · Renews Mar 15</div>
              </div>
              <button className="btn btn-ghost btn-sm">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
