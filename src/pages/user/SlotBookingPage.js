import React, { useState, useEffect } from 'react';
import { slotAPI } from '../../api';
import { Clock, CheckCircle, XCircle, Loader, Calendar } from 'lucide-react';

export default function SlotBookingPage() {
  const [slots, setSlots]         = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [booking, setBooking]     = useState(null);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadData(); }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        slotAPI.getSlots(selectedDate),
        slotAPI.getMyBookings(),
      ]);
      setSlots(slotsRes.data.data || []);
      setMyBookings(bookingsRes.data.data || []);
    } catch (err) {
      setError('Failed to load slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slot) => {
    setBooking(slot.time);
    setError('');
    try {
      await slotAPI.bookSlot({ date: selectedDate, startTime: slot.time });
      setSuccess(`Slot ${slot.time}–${slot.endTime} booked successfully!`);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book slot.');
    } finally {
      setBooking(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      await slotAPI.cancelBooking(id);
      setSuccess('Booking cancelled.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel booking.');
    }
  };

  const crowdColor = (pct) => pct < 40 ? '#00ff87' : pct < 70 ? '#ffd166' : '#ff3b3b';
  const crowdLabel = (pct) => pct < 40 ? 'Low' : pct < 70 ? 'Moderate' : 'Busy';

  // Tomorrow's date for min
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="page-title">SLOT BOOKING</h1>
        <p className="page-subtitle">Reserve your gym time in advance</p>
      </div>

      {error   && <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Slots grid */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>AVAILABLE SLOTS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--text-secondary)" />
              <input type="date" value={selectedDate} min={minDate} onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '6px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading slots...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {slots.map(slot => {
                const isMySlot = slot.myBooking !== null;
                const isFull   = !slot.isAvailable;
                const color    = crowdColor(slot.crowdPct);

                return (
                  <div key={slot.time} style={{
                    padding: 16, borderRadius: 10,
                    background: isMySlot ? 'rgba(0,255,135,0.08)' : 'var(--bg-elevated)',
                    border: `1px solid ${isMySlot ? 'rgba(0,255,135,0.3)' : isFull ? 'rgba(255,59,59,0.2)' : 'var(--border-subtle)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15 }}>{slot.time}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>to {slot.endTime}</div>
                      </div>
                      {isMySlot
                        ? <CheckCircle size={18} color="#00ff87" />
                        : isFull
                        ? <XCircle size={18} color="#ff3b3b" />
                        : <Clock size={18} color="var(--text-muted)" />
                      }
                    </div>

                    {/* Crowd bar */}
                    <div style={{ height: 5, background: 'var(--bg-card)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ width: `${slot.crowdPct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 12 }}>
                      <span style={{ color }}>{crowdLabel(slot.crowdPct)} · {slot.crowdPct}%</span>
                      <span style={{ color: 'var(--text-muted)' }}>{slot.booked}/{slot.capacity}</span>
                    </div>

                    {isMySlot ? (
                      <button onClick={() => handleCancel(slot.myBooking.id)} className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        Cancel Booking
                      </button>
                    ) : (
                      <button
                        onClick={() => !isFull && handleBook(slot)}
                        disabled={isFull || booking === slot.time}
                        className="btn btn-sm"
                        style={{
                          width: '100%', justifyContent: 'center',
                          background: isFull ? 'var(--bg-card)' : 'rgba(0,255,135,0.15)',
                          border: `1px solid ${isFull ? 'var(--border-subtle)' : 'rgba(0,255,135,0.3)'}`,
                          color: isFull ? 'var(--text-muted)' : '#00ff87',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                        }}>
                        {booking === slot.time ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : isFull ? 'Fully Booked' : 'Book Slot'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My bookings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>MY BOOKINGS</div>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
              No upcoming bookings
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myBookings.map(b => (
                <div key={b.id} style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid rgba(0,255,135,0.2)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00ff87' }}>{b.startTime} – {b.endTime}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <button onClick={() => handleCancel(b.id)} className="btn btn-danger btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
