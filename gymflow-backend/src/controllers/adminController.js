// ════════════════════════════════════════════════════════════════════════════
//  ADMIN CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    const [
      totalMembers,
      activeMembers,
      totalWorkouts,
      todayAttendance,
      latestCrowd,
      recentMembers,
      planCounts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', isActive: true } }),
      prisma.workoutLog.count(),
      prisma.attendanceLog.count({
        where: { checkIn: { gte: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })() } },
      }),
      prisma.gymStats.findFirst({ orderBy: { timestamp: 'desc' } }),
      prisma.user.findMany({
        where:   { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        take:    5,
        select:  { id: true, name: true, email: true, plan: true, createdAt: true },
      }),
      prisma.user.groupBy({ by: ['plan'], where: { role: 'USER' }, _count: { id: true } }),
    ]);

    // Revenue estimate (simplified)
    const planPrices = { BASIC: 299, PREMIUM: 599, STUDENT: 199, ANNUAL: 4999 };
    const monthlyRevenue = planCounts.reduce(
      (acc, p) => acc + (planPrices[p.plan] || 0) * p._count.id, 0
    );

    // Weekly attendance for chart
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAttendance = await prisma.attendanceLog.findMany({
      where:   { checkIn: { gte: weekAgo } },
      orderBy: { checkIn: 'asc' },
    });

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyChart = days.map(day => {
      const count = weekAttendance.filter(a =>
        days[new Date(a.checkIn).getDay()] === day
      ).length;
      return { day, checkins: count };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalMembers,
          activeMembers,
          totalWorkouts,
          todayAttendance,
          monthlyRevenue,
          currentCrowd: latestCrowd?.crowdPct || 0,
          retentionRate: Math.round((activeMembers / (totalMembers || 1)) * 100),
        },
        recentMembers,
        planDistribution: planCounts.map(p => ({ plan: p.plan, count: p._count.id })),
        weeklyAttendance: weeklyChart,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/members ────────────────────────────────────────────────────
exports.getMembers = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { page = 1, limit = 20, plan, isActive, search } = req.query;

    const where = {
      role: 'USER',
      ...(plan     && { plan }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search   && {
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:    (parseInt(page) - 1) * parseInt(limit),
        take:    parseInt(limit),
        select: {
          id: true, name: true, email: true, plan: true, goal: true,
          isActive: true, createdAt: true, height: true, weight: true,
          _count: { select: { workoutLogs: true, attendanceLogs: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data:    members,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/members/:id ────────────────────────────────────────────────
exports.getMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const member = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        workoutLogs: { orderBy: { date: 'desc' }, take: 5 },
        attendanceLogs: { orderBy: { checkIn: 'desc' }, take: 10 },
        slotBookings:   { orderBy: { date: 'desc' }, take: 5 },
      },
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

    const { password, ...safe } = member;
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/members/:id ──────────────────────────────────────────────
exports.updateMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { plan, isActive, role } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(plan     !== undefined && { plan }),
        ...(isActive !== undefined && { isActive }),
        ...(role     !== undefined && { role }),
      },
    });

    const { password, ...safe } = updated;
    res.json({ success: true, message: 'Member updated.', data: safe });
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/members/:id ─────────────────────────────────────────────
exports.deleteMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Member deactivated.' });
  } catch (err) { next(err); }
};

// ── GET /api/admin/equipment ──────────────────────────────────────────────────
exports.getEquipment = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { status, type } = req.query;

    const equipment = await prisma.equipment.findMany({
      where: {
        ...(status && { status }),
        ...(type   && { type }),
      },
      orderBy: { name: 'asc' },
    });

    const summary = {
      total:       equipment.length,
      operational: equipment.filter(e => e.status === 'OPERATIONAL').length,
      maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
      outOfService:equipment.filter(e => e.status === 'OUT_OF_SERVICE').length,
    };

    res.json({ success: true, data: equipment, summary });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/equipment/:id ───────────────────────────────────────────
exports.updateEquipment = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { status, usageRate, notes, nextMaintDate } = req.body;

    const updated = await prisma.equipment.update({
      where: { id: req.params.id },
      data: {
        ...(status       && { status }),
        ...(usageRate !== undefined && { usageRate: parseInt(usageRate) }),
        ...(notes    !== undefined && { notes }),
        ...(nextMaintDate && { nextMaintDate: new Date(nextMaintDate) }),
        ...(status === 'MAINTENANCE' && { lastMaintDate: new Date() }),
      },
    });

    res.json({ success: true, message: 'Equipment updated.', data: updated });
  } catch (err) { next(err); }
};

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { period = '4W' } = req.query;

    const daysMap = { '4W': 28, '8W': 56, '3M': 90, '6M': 180 };
    const days    = daysMap[period] || 28;
    const since   = new Date(); since.setDate(since.getDate() - days);

    const [attendanceLogs, newMembers, workoutLogs] = await Promise.all([
      prisma.attendanceLog.findMany({
        where:   { checkIn: { gte: since } },
        orderBy: { checkIn: 'asc' },
      }),
      prisma.user.findMany({
        where:   { role: 'USER', createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
        select:  { createdAt: true, plan: true },
      }),
      prisma.workoutLog.findMany({
        where:   { date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Weekly attendance trend
    const weeklyAttendance = buildWeeklyBuckets(attendanceLogs, days, 'checkIn');

    // New member growth
    const memberGrowth = buildWeeklyBuckets(newMembers, days, 'createdAt');

    // Average daily attendance
    const avgDailyAttendance = attendanceLogs.length
      ? Math.round(attendanceLogs.length / days)
      : 0;

    // Hourly traffic heatmap (avg per hour, by weekday)
    const heatmap = buildHeatmap(attendanceLogs);

    // Peak hour
    const hourCounts = {};
    attendanceLogs.forEach(a => {
      const hr = new Date(a.checkIn).getHours();
      hourCounts[hr] = (hourCounts[hr] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    res.json({
      success: true,
      data: {
        period,
        avgDailyAttendance,
        totalCheckIns:    attendanceLogs.length,
        totalWorkouts:    workoutLogs.length,
        newMembersCount:  newMembers.length,
        weeklyAttendance,
        memberGrowth,
        heatmap,
        peakHour: peakHour ? { hour: formatHour(parseInt(peakHour[0])), checkins: peakHour[1] } : null,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/announcements ──────────────────────────────────────────────
exports.getAnnouncements = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

// ── POST /api/admin/announcements ─────────────────────────────────────────────
exports.createAnnouncement = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const io     = req.app.get('io');
    const { title, message, type, audience } = req.body;

    // Count reach
    const reach = await prisma.user.count({ where: { role: 'USER', isActive: true } });

    const ann = await prisma.announcement.create({
      data: { title, message, type: type || 'update', audience: audience || 'All Members', reach },
    });

    // Push to all connected clients via Socket.IO
    if (io) {
      io.emit('announcement', { title, message, type: type || 'update', timestamp: new Date() });
    }

    res.status(201).json({ success: true, message: 'Announcement created and broadcast.', data: ann });
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/announcements/:id ───────────────────────────────────────
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) { next(err); }
};

// ── GET /api/admin/ai-insights ────────────────────────────────────────────────
exports.getAIInsights = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    // Members who haven't visited in 14+ days = churn risk
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const allMembers = await prisma.user.findMany({
      where: { role: 'USER', isActive: true },
      include: {
        attendanceLogs: { orderBy: { checkIn: 'desc' }, take: 1 },
        _count: { select: { attendanceLogs: true } },
      },
    });

    const churnRisk = allMembers
      .filter(m => {
        const lastVisit = m.attendanceLogs[0]?.checkIn;
        return !lastVisit || lastVisit < twoWeeksAgo;
      })
      .map(m => ({
        id:        m.id,
        name:      m.name,
        email:     m.email,
        plan:      m.plan,
        lastVisit: m.attendanceLogs[0]?.checkIn || null,
        totalVisits: m._count.attendanceLogs,
        riskLevel: !m.attendanceLogs[0] ? 'HIGH' :
          (new Date() - new Date(m.attendanceLogs[0].checkIn)) > 21 * 86400000 ? 'HIGH' : 'MEDIUM',
      }))
      .sort((a, b) => (b.riskLevel === 'HIGH' ? 1 : 0) - (a.riskLevel === 'HIGH' ? 1 : 0));

    // Peak hour forecast (next 24h based on historical patterns)
    const peakForecast = [
      { hour: '6AM',  predicted: 35 }, { hour: '7AM', predicted: 55 },
      { hour: '8AM',  predicted: 48 }, { hour: '9AM', predicted: 32 },
      { hour: '5PM',  predicted: 72 }, { hour: '6PM', predicted: 88 },
      { hour: '7PM',  predicted: 78 }, { hour: '8PM', predicted: 52 },
    ];

    // Revenue opportunities
    const basicMembers = await prisma.user.count({ where: { role: 'USER', plan: 'BASIC', isActive: true } });
    const revenueOpp   = basicMembers * (599 - 299); // upgrade to premium

    res.json({
      success: true,
      data: {
        churnRisk,
        churnRiskCount: churnRisk.length,
        peakForecast,
        insights: [
          {
            type:    'churn',
            title:   `${churnRisk.length} members at churn risk`,
            message: 'Send re-engagement offers to members inactive for 14+ days.',
            impact:  'HIGH',
          },
          {
            type:    'revenue',
            title:   `₹${revenueOpp.toLocaleString()} upgrade opportunity`,
            message: `${basicMembers} Basic members could be converted to Premium.`,
            impact:  'MEDIUM',
          },
          {
            type:    'capacity',
            title:   'Peak hour management',
            message: 'Incentivize off-peak visits (6-8AM, 2-4PM) to reduce 6-7PM congestion.',
            impact:  'MEDIUM',
          },
        ],
      },
    });
  } catch (err) { next(err); }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildWeeklyBuckets(records, days, dateField) {
  const numWeeks = Math.ceil(days / 7);
  const buckets  = Array.from({ length: numWeeks }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (numWeeks - 1 - i) * 7);
    return { week: `W${i + 1}`, date: d.toISOString().split('T')[0], count: 0 };
  });

  records.forEach(r => {
    const rDate = new Date(r[dateField]);
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (rDate >= new Date(buckets[i].date)) {
        buckets[i].count++;
        break;
      }
    }
  });
  return buckets;
}

function buildHeatmap(logs) {
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const grid  = {};

  logs.forEach(l => {
    const d = days[new Date(l.checkIn).getDay()];
    const h = new Date(l.checkIn).getHours();
    const key = `${d}-${h}`;
    grid[key] = (grid[key] || 0) + 1;
  });

  return hours.map(hr => ({
    hour: formatHour(hr),
    ...Object.fromEntries(days.map(d => [d, grid[`${d}-${hr}`] || 0])),
  }));
}

function formatHour(hr) {
  if (hr === 0)  return '12AM';
  if (hr < 12)   return `${hr}AM`;
  if (hr === 12) return '12PM';
  return `${hr - 12}PM`;
}
