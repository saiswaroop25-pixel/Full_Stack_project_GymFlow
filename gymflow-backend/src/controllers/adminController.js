const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const PLAN_PRICES = { BASIC: 299, PREMIUM: 599, STUDENT: 199, ANNUAL: 4999 };
const FORECAST_TEMPLATE = [
  { hour: '5PM', baseline: 68, confidence: 86 },
  { hour: '6PM', baseline: 82, confidence: 91 },
  { hour: '7PM', baseline: 88, confidence: 94 },
  { hour: '8PM', baseline: 64, confidence: 89 },
  { hour: '9PM', baseline: 42, confidence: 84 },
];

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
        where: {
          checkIn: {
            gte: (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return today;
            })(),
          },
        },
      }),
      prisma.gymStats.findFirst({ orderBy: { timestamp: 'desc' } }),
      prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, plan: true, createdAt: true },
      }),
      prisma.user.groupBy({ by: ['plan'], where: { role: 'USER' }, _count: { id: true } }),
    ]);

    const monthlyRevenue = planCounts.reduce(
      (sum, plan) => sum + (PLAN_PRICES[plan.plan] || 0) * plan._count.id,
      0
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekAttendance = await prisma.attendanceLog.findMany({
      where: { checkIn: { gte: weekAgo } },
      orderBy: { checkIn: 'asc' },
    });

    const weeklyAttendance = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({
      day,
      checkins: weekAttendance.filter(
        (attendance) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(attendance.checkIn).getDay()] === day
      ).length,
    }));

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
        planDistribution: planCounts.map((plan) => ({ plan: plan.plan, count: plan._count.id })),
        weeklyAttendance,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { page = 1, limit = 20, plan, isActive, search } = req.query;

    const where = {
      role: 'USER',
      ...(plan && { plan }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          goal: true,
          isActive: true,
          createdAt: true,
          height: true,
          weight: true,
          _count: { select: { workoutLogs: true, attendanceLogs: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: members,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const member = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        workoutLogs: { orderBy: { date: 'desc' }, take: 5 },
        attendanceLogs: { orderBy: { checkIn: 'desc' }, take: 10 },
        slotBookings: { orderBy: { date: 'desc' }, take: 5 },
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const { password, ...safe } = member;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { plan, isActive, role } = req.body;
    const data = {};

    if (hasOwn(req.body, 'plan')) data.plan = plan;
    if (hasOwn(req.body, 'isActive')) data.isActive = isActive;
    if (hasOwn(req.body, 'role')) data.role = role;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });

    const { password, ...safe } = updated;
    res.json({ success: true, message: 'Member updated.', data: safe });
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Member deactivated.' });
  } catch (err) {
    next(err);
  }
};

exports.getEquipment = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { status, type } = req.query;

    const equipment = await prisma.equipment.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    });

    const summary = {
      total: equipment.length,
      operational: equipment.filter((item) => item.status === 'OPERATIONAL').length,
      maintenance: equipment.filter((item) => item.status === 'MAINTENANCE').length,
      outOfService: equipment.filter((item) => item.status === 'OUT_OF_SERVICE').length,
    };

    res.json({ success: true, data: equipment, summary });
  } catch (err) {
    next(err);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { status, usageRate, notes, nextMaintDate } = req.body;
    const data = {};

    if (hasOwn(req.body, 'status')) data.status = status;
    if (hasOwn(req.body, 'usageRate')) data.usageRate = parseInt(usageRate, 10);
    if (hasOwn(req.body, 'notes')) data.notes = notes;
    if (hasOwn(req.body, 'nextMaintDate')) {
      data.nextMaintDate = nextMaintDate ? new Date(nextMaintDate) : null;
    }
    if (status === 'MAINTENANCE') {
      data.lastMaintDate = new Date();
    }

    const updated = await prisma.equipment.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, message: 'Equipment updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { period = '4W' } = req.query;

    const daysMap = { '4W': 28, '8W': 56, '3M': 90, '6M': 180 };
    const days = daysMap[period] || 28;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [attendanceLogs, newMembers, workoutLogs] = await Promise.all([
      prisma.attendanceLog.findMany({
        where: { checkIn: { gte: since } },
        orderBy: { checkIn: 'asc' },
      }),
      prisma.user.findMany({
        where: { role: 'USER', createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, plan: true },
      }),
      prisma.workoutLog.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const weeklyAttendance = buildWeeklyBuckets(attendanceLogs, days, 'checkIn');
    const memberGrowth = buildWeeklyBuckets(newMembers, days, 'createdAt');
    const avgDailyAttendance = attendanceLogs.length ? Math.round(attendanceLogs.length / days) : 0;
    const heatmap = buildHeatmap(attendanceLogs);

    const hourCounts = {};
    attendanceLogs.forEach((attendance) => {
      const hour = new Date(attendance.checkIn).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    res.json({
      success: true,
      data: {
        period,
        avgDailyAttendance,
        totalCheckIns: attendanceLogs.length,
        totalWorkouts: workoutLogs.length,
        newMembersCount: newMembers.length,
        weeklyAttendance,
        memberGrowth,
        heatmap,
        peakHour: peakHour ? { hour: formatHour(parseInt(peakHour[0], 10)), checkins: peakHour[1] } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');
    const { title, message, type, audience } = req.body;

    const reach = await prisma.user.count({ where: { role: 'USER', isActive: true } });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        type: type || 'update',
        audience: audience || 'All Members',
        reach,
      },
    });

    if (io) {
      io.emit('announcement', {
        title,
        message,
        type: type || 'update',
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created and broadcast.',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getAIInsights = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [members, stats] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'USER', isActive: true },
        include: {
          attendanceLogs: { orderBy: { checkIn: 'desc' }, take: 6 },
          workoutLogs: { orderBy: { date: 'desc' }, take: 6 },
        },
      }),
      prisma.gymStats.findMany({
        where: {
          timestamp: {
            gte: (() => {
              const since = new Date();
              since.setDate(since.getDate() - 14);
              return since;
            })(),
          },
        },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    const churnRisk = members
      .map((member) => buildChurnEntry(member))
      .filter((member) => member.riskScore >= 55)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8);

    const peakForecast = buildPeakForecast(stats);
    const planSuggestions = members
      .filter((member) => member.plan === 'BASIC' || member.plan === 'STUDENT')
      .map((member) => {
        const recentVisits = member.attendanceLogs.length;
        const preferredAction = member.plan === 'STUDENT' ? 'Cross-sell' : 'Upsell';
        const suggestion =
          member.plan === 'STUDENT'
            ? 'Offer a Premium trial before exams end'
            : 'Highlight Premium access during evening rush hours';
        return {
          id: member.id,
          member: member.name,
          action: preferredAction,
          suggestion,
          estimatedMonthlyLift: member.plan === 'STUDENT' ? 400 : 300,
          recentVisits,
        };
      })
      .sort((a, b) => b.estimatedMonthlyLift - a.estimatedMonthlyLift || a.recentVisits - b.recentVisits)
      .slice(0, 5);

    const peakHour = peakForecast.reduce((best, slot) => (slot.expected > best.expected ? slot : best), peakForecast[0]);
    const predictionAccuracy = stats.length ? 90 + Math.min(7, Math.floor(stats.length / 20)) : 86;

    res.json({
      success: true,
      data: {
        summary: {
          membersAtRisk: churnRisk.length,
          predictedPeakHour: peakHour?.hour || '6PM',
          upsellOpportunities: planSuggestions.length,
          predictionAccuracy,
        },
        churnRisk,
        peakForecast,
        planSuggestions,
        insights: [
          {
            type: 'churn',
            title: `${churnRisk.length} members need re-engagement`,
            message: 'Members with long gaps in visits or sharply reduced attendance are ranked highest.',
            impact: 'HIGH',
          },
          {
            type: 'capacity',
            title: `${peakHour?.hour || '6PM'} remains the busiest window`,
            message: 'Use alerts and incentives to shift flexible users toward quieter slots.',
            impact: 'MEDIUM',
          },
          {
            type: 'revenue',
            title: `${planSuggestions.length} targeted upgrade opportunities`,
            message: 'Focus on active Basic and Student members with consistent gym usage.',
            impact: 'MEDIUM',
          },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
};

function buildChurnEntry(member) {
  const lastVisit = member.attendanceLogs[0]?.checkIn || null;
  const lastWorkout = member.workoutLogs[0]?.date || null;
  const daysSinceVisit = lastVisit ? Math.floor((Date.now() - new Date(lastVisit)) / 86400000) : 30;
  const visitsLastMonth = member.attendanceLogs.filter(
    (attendance) => Date.now() - new Date(attendance.checkIn).getTime() <= 30 * 86400000
  ).length;
  const riskScore = Math.min(
    98,
    35 + Math.min(daysSinceVisit, 28) * 2 + Math.max(0, 4 - visitsLastMonth) * 7
  );

  let reason = 'Attendance trend is healthy.';
  if (!lastVisit) reason = 'No recent visits recorded.';
  else if (daysSinceVisit >= 21) reason = 'Long absence combined with declining workout activity.';
  else if (visitsLastMonth <= 2) reason = 'Visit frequency fell below the usual monthly baseline.';
  else if (!lastWorkout) reason = 'Workouts have not been logged despite check-ins.';

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    plan: member.plan,
    riskScore,
    riskLevel: riskScore >= 80 ? 'HIGH' : riskScore >= 65 ? 'MEDIUM' : 'LOW',
    lastVisit,
    lastWorkout,
    visitsLastMonth,
    reason,
  };
}

function buildPeakForecast(stats) {
  const byHour = {};
  stats.forEach((snapshot) => {
    const hour = new Date(snapshot.timestamp).getHours();
    if (!byHour[hour]) byHour[hour] = [];
    byHour[hour].push(snapshot.crowdPct);
  });

  return FORECAST_TEMPLATE.map((slot) => {
    const hour24 = parseHourLabel(slot.hour);
    const values = byHour[hour24];
    const expected = values?.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : slot.baseline;

    return {
      hour: slot.hour,
      expected,
      confidence: values?.length ? Math.min(98, slot.confidence + Math.min(values.length, 6)) : slot.confidence,
    };
  });
}

function buildWeeklyBuckets(records, days, dateField) {
  const numberOfWeeks = Math.ceil(days / 7);
  const buckets = Array.from({ length: numberOfWeeks }, (_, index) => {
    const bucketDate = new Date();
    bucketDate.setDate(bucketDate.getDate() - (numberOfWeeks - 1 - index) * 7);
    return { week: `W${index + 1}`, date: bucketDate.toISOString().split('T')[0], count: 0 };
  });

  records.forEach((record) => {
    const recordDate = new Date(record[dateField]);
    for (let index = buckets.length - 1; index >= 0; index -= 1) {
      if (recordDate >= new Date(buckets[index].date)) {
        buckets[index].count += 1;
        break;
      }
    }
  });

  return buckets;
}

function buildHeatmap(logs) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const grid = {};

  logs.forEach((log) => {
    const day = days[new Date(log.checkIn).getDay()];
    const hour = new Date(log.checkIn).getHours();
    const key = `${day}-${hour}`;
    grid[key] = (grid[key] || 0) + 1;
  });

  return hours.map((hour) => ({
    hour: formatHour(hour),
    ...Object.fromEntries(days.map((day) => [day, grid[`${day}-${hour}`] || 0])),
  }));
}

function formatHour(hour) {
  if (hour === 0) return '12AM';
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return '12PM';
  return `${hour - 12}PM`;
}

function parseHourLabel(label) {
  const match = /^(\d+)(AM|PM)$/.exec(label);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const meridiem = match[2];
  if (meridiem === 'AM') return value === 12 ? 0 : value;
  return value === 12 ? 12 : value + 12;
}
