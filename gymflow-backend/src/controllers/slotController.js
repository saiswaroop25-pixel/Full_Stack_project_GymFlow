const SLOT_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

exports.getSlots = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { date } = req.query;

    const targetDate = normalizeSlotDate(date ? new Date(date) : new Date());
    const start = new Date(targetDate);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await prisma.slotBooking.findMany({
      where: { date: { gte: start, lte: end }, status: 'BOOKED' },
    });

    const slots = SLOT_TIMES.map((time) => {
      const booked = bookings.filter((booking) => booking.startTime === time);
      const capacity = 30;

      return {
        time,
        endTime: addHour(time),
        capacity,
        booked: booked.length,
        available: capacity - booked.length,
        crowdPct: Math.round((booked.length / capacity) * 100),
        isAvailable: booked.length < capacity,
        myBooking: bookings.find((booking) => booking.startTime === time && booking.userId === req.user.id) || null,
      };
    });

    res.json({ success: true, data: slots, date: targetDate });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const today = normalizeSlotDate(new Date());

    const bookings = await prisma.slotBooking.findMany({
      where: {
        userId: req.user.id,
        status: 'BOOKED',
        date: { gte: today },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

exports.bookSlot = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { date, startTime } = req.body;

    const slotDate = normalizeSlotDate(new Date(date));
    const today = normalizeSlotDate(new Date());
    if (slotDate < today) {
      return res.status(400).json({ success: false, message: 'You can only book current or future dates.' });
    }

    if (!SLOT_TIMES.includes(startTime)) {
      return res.status(400).json({ success: false, message: 'This start time is not available for booking.' });
    }

    const start = new Date(slotDate);
    const end = new Date(slotDate);
    end.setHours(23, 59, 59, 999);

    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.slotBooking.findFirst({
        where: { userId: req.user.id, date: { gte: start, lte: end }, startTime, status: 'BOOKED' },
      });
      if (existing) {
        const error = new Error('You already have this slot booked.');
        error.statusCode = 409;
        throw error;
      }

      const count = await tx.slotBooking.count({
        where: { date: { gte: start, lte: end }, startTime, status: 'BOOKED' },
      });
      if (count >= 30) {
        const error = new Error('This slot is fully booked.');
        error.statusCode = 400;
        throw error;
      }

      return tx.slotBooking.create({
        data: {
          userId: req.user.id,
          date: slotDate,
          startTime,
          endTime: addHour(startTime),
          crowdPct: Math.round(((count + 1) / 30) * 100),
        },
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json({ success: true, message: 'Slot booked successfully.', data: booking });
  } catch (err) {
    if (err.code === 'P2034') {
      return res.status(409).json({ success: false, message: 'This slot changed while you were booking it. Please try again.' });
    }

    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const booking = await prisma.slotBooking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    await prisma.slotBooking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    next(err);
  }
};

function addHour(time) {
  const [hour, minute] = time.split(':').map(Number);
  return `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function normalizeSlotDate(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
