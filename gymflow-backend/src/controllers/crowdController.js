const CAPACITY = 200;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_BASELINES = { Sun: 28, Mon: 54, Tue: 58, Wed: 61, Thu: 57, Fri: 63, Sat: 46 };

exports.getCurrent = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const latest = await prisma.gymStats.findFirst({ orderBy: { timestamp: 'desc' } });

    if (!latest) {
      return res.json({
        success: true,
        data: {
          checkedIn: 0,
          capacity: CAPACITY,
          crowdPct: 0,
          crowdLevel: 'LOW',
          timestamp: new Date(),
        },
      });
    }

    res.json({ success: true, data: latest });
  } catch (err) {
    next(err);
  }
};

exports.getHourly = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const start = new Date();
    const end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const stats = await prisma.gymStats.findMany({
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = {};
    stats.forEach((snapshot) => {
      const hour = new Date(snapshot.timestamp).getHours();
      if (!buckets[hour]) buckets[hour] = [];
      buckets[hour].push(snapshot.crowdPct);
    });

    const hourly = Object.entries(buckets).map(([hour, values]) => ({
      hour: formatHour(parseInt(hour, 10)),
      crowd: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
    }));

    res.json({ success: true, data: hourly });
  } catch (err) {
    next(err);
  }
};

exports.getWeekly = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const stats = await prisma.gymStats.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    const buckets = {};
    stats.forEach((snapshot) => {
      const day = DAY_NAMES[new Date(snapshot.timestamp).getDay()];
      if (!buckets[day]) buckets[day] = [];
      buckets[day].push(snapshot.crowdPct);
    });

    const weekly = DAY_NAMES.map((day) => {
      const values = buckets[day];
      return {
        day,
        avg: values?.length
          ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
          : DAY_BASELINES[day],
      };
    });

    res.json({ success: true, data: weekly });
  } catch (err) {
    next(err);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    const existing = await prisma.attendanceLog.findFirst({
      where: { userId: req.user.id, checkOut: null },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in. Please check out first.' });
    }

    const log = await prisma.attendanceLog.create({
      data: { userId: req.user.id },
    });

    const payload = await publishCurrentCrowd(req.app);

    res.status(201).json({
      success: true,
      message: 'Checked in successfully.',
      data: { log, crowd: payload },
    });
  } catch (err) {
    next(err);
  }
};

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
    const duration = Math.round((checkOut - log.checkIn) / 60000);

    const updated = await prisma.attendanceLog.update({
      where: { id: log.id },
      data: { checkOut, duration },
    });

    const payload = await publishCurrentCrowd(req.app);

    res.json({
      success: true,
      message: `Checked out. Duration: ${duration} min.`,
      data: { log: updated, crowd: payload },
    });
  } catch (err) {
    next(err);
  }
};

exports.overrideCrowd = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const { crowdPct, checkedIn } = req.body;

    const pct = parseInt(crowdPct, 10);
    const level = crowdLevel(pct);
    const count =
      checkedIn === undefined || checkedIn === null || checkedIn === ''
        ? Math.round((pct / 100) * CAPACITY)
        : parseInt(checkedIn, 10);

    await prisma.gymStats.create({
      data: { checkedIn: count, capacity: CAPACITY, crowdPct: pct, crowdLevel: level },
    });

    const payload = {
      checkedIn: count,
      capacity: CAPACITY,
      crowdPct: pct,
      crowdLevel: level,
      timestamp: new Date(),
      isOverride: true,
    };

    if (io) io.emit('crowd:update', payload);

    res.json({ success: true, message: 'Crowd overridden and broadcast to all clients.', data: payload });
  } catch (err) {
    next(err);
  }
};

exports.broadcast = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const { message, type } = req.body;

    if (io) {
      io.emit('crowd:alert', { message, type: type || 'info', timestamp: new Date() });
    }

    res.json({ success: true, message: 'Alert broadcast to all connected clients.' });
  } catch (err) {
    next(err);
  }
};

async function publishCurrentCrowd(app) {
  const prisma = app.get('prisma');
  const io = app.get('io');
  const checkedIn = await prisma.attendanceLog.count({ where: { checkOut: null } });
  const crowdPct = Math.round((checkedIn / CAPACITY) * 100);
  const payload = {
    checkedIn,
    capacity: CAPACITY,
    crowdPct,
    crowdLevel: crowdLevel(crowdPct),
    timestamp: new Date(),
  };

  await prisma.gymStats.create({ data: payload });
  if (io) io.emit('crowd:update', payload);

  return payload;
}

function crowdLevel(pct) {
  if (pct < 40) return 'LOW';
  if (pct < 70) return 'MODERATE';
  return 'HIGH';
}

function formatHour(hour) {
  if (hour === 0) return '12AM';
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return '12PM';
  return `${hour - 12}PM`;
}
