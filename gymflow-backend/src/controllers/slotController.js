// ── GET /api/slots ────────────────────────────────────────────────────────────
// Returns all available slots for a date (or next 7 days)
exports.getSlots = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(targetDate); end.setHours(23, 59, 59, 999);

    const bookings = await prisma.slotBooking.findMany({
      where:   { date: { gte: start, lte: end }, status: 'BOOKED' },
      include: { user: { select: { name: true, email: true } } },
    });

    // Generate available time slots for the day
    const times = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00',
                   '14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

    const slots = times.map(time => {
      const booked = bookings.filter(b => b.startTime === time);
      const capacity = 30;
      return {
        time,
        endTime:    addHour(time),
        capacity,
        booked:     booked.length,
        available:  capacity - booked.length,
        crowdPct:   Math.round((booked.length / capacity) * 100),
        isAvailable: booked.length < capacity,
        // Only show if the slot is user's own booking
        myBooking: bookings.find(b => b.startTime === time && b.userId === req.user.id) || null,
      };
    });

    res.json({ success: true, data: slots, date: targetDate });
  } catch (err) { next(err); }
};

// ── GET /api/slots/mine ───────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const bookings = await prisma.slotBooking.findMany({
      where:   { userId: req.user.id, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// ── POST /api/slots/book ──────────────────────────────────────────────────────
exports.bookSlot = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { date, startTime } = req.body;

    const slotDate = new Date(date);
    const start    = new Date(slotDate); start.setHours(0, 0, 0, 0);
    const end      = new Date(slotDate); end.setHours(23, 59, 59, 999);

    // Check if already booked this slot
    const existing = await prisma.slotBooking.findFirst({
      where: { userId: req.user.id, date: { gte: start, lte: end }, startTime, status: 'BOOKED' },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have this slot booked.' });
    }

    // Check capacity (max 30 per slot)
    const count = await prisma.slotBooking.count({
      where: { date: { gte: start, lte: end }, startTime, status: 'BOOKED' },
    });
    if (count >= 30) {
      return res.status(400).json({ success: false, message: 'This slot is fully booked.' });
    }

    const booking = await prisma.slotBooking.create({
      data: {
        userId:    req.user.id,
        date:      slotDate,
        startTime,
        endTime:   addHour(startTime),
        crowdPct:  Math.round((count / 30) * 100),
      },
    });

    res.status(201).json({ success: true, message: 'Slot booked successfully.', data: booking });
  } catch (err) { next(err); }
};

// ── DELETE /api/slots/:id ─────────────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const booking = await prisma.slotBooking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    await prisma.slotBooking.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) { next(err); }
};

function addHour(time) {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
