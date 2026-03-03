// ── GET /api/crowd/current ────────────────────────────────────────────────────
exports.getCurrent = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const latest = await prisma.gymStats.findFirst({ orderBy: { timestamp: 'desc' } });

    if (!latest) {
      return res.json({
        success: true,
        data: { checkedIn: 0, capacity: 200, crowdPct: 0, crowdLevel: 'LOW', timestamp: new Date() },
      });
    }

    res.json({ success: true, data: latest });
  } catch (err) { next(err); }
};

// ── GET /api/crowd/hourly ─────────────────────────────────────────────────────
// Returns average crowd % per hour for today
exports.getHourly = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const stats = await prisma.gymStats.findMany({
      where:   { timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'asc' },
    });

    // Group into hourly buckets
    const buckets = {};
    stats.forEach(s => {
      const hr = new Date(s.timestamp).getHours();
      if (!buckets[hr]) buckets[hr] = [];
      buckets[hr].push(s.crowdPct);
    });

    const hourly = Object.entries(buckets).map(([hr, vals]) => ({
      hour:  formatHour(parseInt(hr)),
      crowd: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));

    res.json({ success: true, data: hourly });
  } catch (err) { next(err); }
};

// ── GET /api/crowd/weekly ─────────────────────────────────────────────────────
exports.getWeekly = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const since = new Date(); since.setDate(since.getDate() - 7);

    const stats = await prisma.gymStats.findMany({
      where:   { timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = {};
    stats.forEach(s => {
      const day = days[new Date(s.timestamp).getDay()];
      if (!buckets[day]) buckets[day] = [];
      buckets[day].push(s.crowdPct);
    });

    const weekly = days.map(day => ({
      day,
      avg: buckets[day]
        ? Math.round(buckets[day].reduce((a, b) => a + b, 0) / buckets[day].length)
        : Math.round(25 + Math.random() * 50), // fallback estimate
    }));

    res.json({ success: true, data: weekly });
  } catch (err) { next(err); }
};

// ── POST /api/crowd/checkin ───────────────────────────────────────────────────
exports.checkIn = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    // Check if already checked in (no checkout yet)
    const existing = await prisma.attendanceLog.findFirst({
      where: { userId: req.user.id, checkOut: null },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in. Please check out first.' });
    }

    const log = await prisma.attendanceLog.create({
      data: { userId: req.user.id },
    });

    // Broadcast updated count via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const count = await prisma.attendanceLog.count({ where: { checkOut: null } });
      const pct   = Math.round((count / 200) * 100);
      io.emit('crowd:update', {
        checkedIn:  count,
        capacity:   200,
        crowdPct:   pct,
        crowdLevel: pct < 40 ? 'LOW' : pct < 70 ? 'MODERATE' : 'HIGH',
        timestamp:  new Date(),
      });
    }

    res.status(201).json({ success: true, message: 'Checked in successfully.', data: log });
  } catch (err) { next(err); }
};

// ── POST /api/crowd/checkout ──────────────────────────────────────────────────
exports.checkOut = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    const log = await prisma.attendanceLog.findFirst({
      where: { userId: req.user.id, checkOut: null },
    });
    if (!log) {
      return res.status(400).json({ success: false, message: 'Not currently checked in.' });
    }

    const checkOut = new Date();
    const duration = Math.round((checkOut - log.checkIn) / 60000); // minutes

    const updated = await prisma.attendanceLog.update({
      where: { id: log.id },
      data:  { checkOut, duration },
    });

    // Broadcast
    const io = req.app.get('io');
    if (io) {
      const count = await prisma.attendanceLog.count({ where: { checkOut: null } });
      const pct   = Math.round((count / 200) * 100);
      io.emit('crowd:update', {
        checkedIn:  count,
        capacity:   200,
        crowdPct:   pct,
        crowdLevel: pct < 40 ? 'LOW' : pct < 70 ? 'MODERATE' : 'HIGH',
        timestamp:  new Date(),
      });
    }

    res.json({ success: true, message: `Checked out. Duration: ${duration} min.`, data: updated });
  } catch (err) { next(err); }
};

// ── POST /api/crowd/override (Admin) ─────────────────────────────────────────
exports.overrideCrowd = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const io     = req.app.get('io');
    const { crowdPct, checkedIn } = req.body;

    const pct    = parseInt(crowdPct);
    const level  = pct < 40 ? 'LOW' : pct < 70 ? 'MODERATE' : 'HIGH';
    const count  = checkedIn ? parseInt(checkedIn) : Math.round((pct / 100) * 200);

    await prisma.gymStats.create({
      data: { checkedIn: count, capacity: 200, crowdPct: pct, crowdLevel: level },
    });

    const payload = { checkedIn: count, capacity: 200, crowdPct: pct, crowdLevel: level, timestamp: new Date(), isOverride: true };

    if (io) io.emit('crowd:update', payload);

    res.json({ success: true, message: 'Crowd overridden and broadcast to all clients.', data: payload });
  } catch (err) { next(err); }
};

// ── POST /api/crowd/broadcast (Admin) ────────────────────────────────────────
exports.broadcast = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const { message, type } = req.body;

    if (io) io.emit('crowd:alert', { message, type: type || 'info', timestamp: new Date() });

    res.json({ success: true, message: 'Alert broadcast to all connected clients.' });
  } catch (err) { next(err); }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatHour(hr) {
  if (hr === 0)  return '12AM';
  if (hr < 12)   return `${hr}AM`;
  if (hr === 12) return '12PM';
  return `${hr - 12}PM`;
}
