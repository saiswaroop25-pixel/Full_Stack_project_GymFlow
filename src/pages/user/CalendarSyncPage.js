import React, { useState, useEffect } from 'react';
import { slotAPI } from '../../api';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarSyncPage() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [slots, setSlots]         = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking]     = useState(null);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { if (selectedDate) loadSlots(selectedDate); }, [selectedDate]);

  const loadBookings = async () => {
    try {
      const { data } = await slotAPI.getMyBookings();
      setMyBookings(data.data || []);
    } catch { }
  };

  const loadSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const { data } = await slotAPI.getSlots(date);
      setSlots(data.data || []);
    } catch { } finally { setLoadingSlots(false); }
  };

  const handleBook = async (slot) => {
    setBooking(slot.time);
    setError('');
    try {
      await slotAPI.bookSlot({ date: selectedDate, startTime: slot.time });
      setSuccess(`Slot ${slot.time} booked!`);
      loadSlots(selectedDate);
      loadBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book slot.');
    } finally { setBooking(null); }
  };

  const handleCancel = async (id) => {
    try {
      await slotAPI.cancelBooking(id);
      loadBookings();
      loadSlots(selectedDate);
      setSuccess('Booking cancelled.');
      setTimeout(() => setSuccess(''), 2000);
    } catch { }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth   = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);

  // Which dates have bookings
  const bookedDates = new Set(myBookings.map(b => b.date?.split('T')[0]));

  const crowdColor = (pct) => pct < 40 ? '#00ff87' : pct < 70 ? '#ffd166' : '#ff3b3b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-title">CALENDAR SYNC</h1>
        <p className="page-subtitle">View and book gym slots by date</p>
      </div>

      {error   && <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: 8, color: '#ff3b3b', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ padding: '12px 16px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 8, color: '#00ff87', fontSize: 14 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Calendar */}
        <div className="card" style={{ padding: 24 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={prevMonth} className="btn btn-ghost btn-sm"><ChevronLeft size={18} /></button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{MONTHS[viewMonth]} {viewYear}</div>
            <button onClick={nextMonth} className="btn btn-ghost btn-sm"><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1;
              const dateStr  = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isToday  = dateStr === today.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const hasBooking = bookedDates.has(dateStr);
              const isPast   = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);

              return (
                <div key={day} onClick={() => !isPast && setSelectedDate(dateStr)}
                  style={{
                    padding: '8px 4px', textAlign: 'center', borderRadius: 8, cursor: isPast ? 'default' : 'pointer',
                    background: isSelected ? 'var(--accent-lime)' : isToday ? 'rgba(200,255,0,0.1)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-lime)' : isToday ? 'rgba(200,255,0,0.3)' : 'transparent'}`,
                    color: isSelected ? '#000' : isPast ? 'var(--text-muted)' : 'var(--text-primary)',
                    position: 'relative', transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 14, fontWeight: isToday ? 700 : 400 }}>{day}</div>
                  {hasBooking && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#000' : '#00ff87', margin: '2px auto 0' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff87' }} /> Booked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-lime)' }} /> Selected
            </div>
          </div>
        </div>

        {/* Slots panel */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>
            {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Available time slots</div>

          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Loading slots...</div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ margin: '0 auto 12px' }} />
              <div>No slots available</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
              {slots.map(slot => {
                const isMySlot = slot.myBooking !== null;
                const isFull   = !slot.isAvailable;
                const color    = crowdColor(slot.crowdPct);
                return (
                  <div key={slot.time} style={{
                    padding: '12px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
                    background: isMySlot ? 'rgba(0,255,135,0.08)' : 'var(--bg-elevated)',
                    border: `1px solid ${isMySlot ? 'rgba(0,255,135,0.25)' : 'var(--border-subtle)'}`,
                  }}>
                    <Clock size={14} color={isMySlot ? '#00ff87' : 'var(--text-muted)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{slot.time} – {slot.endTime}</div>
                      <div style={{ fontSize: 11, color, marginTop: 2 }}>{slot.crowdPct}% expected · {slot.booked}/{slot.capacity}</div>
                    </div>
                    {isMySlot ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} color="#00ff87" />
                        <button onClick={() => handleCancel(slot.myBooking.id)} className="btn btn-danger btn-sm">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => !isFull && handleBook(slot)} disabled={isFull || booking === slot.time}
                        className="btn btn-sm"
                        style={{
                          background: isFull ? 'transparent' : 'rgba(0,255,135,0.12)',
                          border: `1px solid ${isFull ? 'var(--border-subtle)' : 'rgba(0,255,135,0.3)'}`,
                          color: isFull ? 'var(--text-muted)' : '#00ff87',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                        }}>
                        {booking === slot.time ? '...' : isFull ? 'Full' : 'Book'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming bookings */}
      {myBookings.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>MY UPCOMING BOOKINGS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {myBookings.map(b => (
              <div key={b.id} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid rgba(0,255,135,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#00ff87', fontWeight: 700 }}>{b.startTime} – {b.endTime}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <button onClick={() => handleCancel(b.id)} className="btn btn-danger btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>Cancel</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
