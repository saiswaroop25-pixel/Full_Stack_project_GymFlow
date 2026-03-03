// ── GET /api/activity/attendance ──────────────────────────────────────────────
exports.getAttendance = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const logs = await prisma.attendanceLog.findMany({
      where:   { userId: req.user.id, checkIn: { gte: since } },
      orderBy: { checkIn: 'desc' },
    });

    // Currently checked in?
    const activeSession = await prisma.attendanceLog.findFirst({
      where: { userId: req.user.id, checkOut: null },
    });

    // Streak calculation
    const streak = calcStreak(logs);

    // Total visits this month
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const visitsThisMonth = logs.filter(l => new Date(l.checkIn) >= monthStart).length;

    // Average session duration
    const logsWithDuration = logs.filter(l => l.duration);
    const avgDuration = logsWithDuration.length
      ? Math.round(logsWithDuration.reduce((a, l) => a + l.duration, 0) / logsWithDuration.length)
      : 0;

    res.json({
      success: true,
      data: {
        logs,
        isCheckedIn:     !!activeSession,
        activeSession,
        streak,
        visitsThisMonth,
        totalVisits:     logs.length,
        avgDuration,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/activity/stats ───────────────────────────────────────────────────
// Today's activity summary (steps, calories, active minutes)
exports.getStats = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const today  = new Date(); today.setHours(0, 0, 0, 0);

    const todayWorkouts = await prisma.workoutLog.findMany({
      where: { userId: req.user.id, date: { gte: today } },
    });

    const totalCalories = todayWorkouts.reduce((a, w) => a + (w.calories || 0), 0);
    const totalDuration = todayWorkouts.reduce((a, w) => a + w.duration, 0);

    res.json({
      success: true,
      data: {
        date:          today,
        workoutsToday: todayWorkouts.length,
        caloriesBurned: totalCalories,
        activeMinutes:  totalDuration,
        // Steps are from wearable integration — returning mock until device sync
        steps: 7832,
        stepsGoal: 10000,
      },
    });
  } catch (err) { next(err); }
};

// ── Streak helper ─────────────────────────────────────────────────────────────
function calcStreak(logs) {
  if (!logs.length) return 0;

  const dates = [...new Set(logs.map(l =>
    new Date(l.checkIn).toISOString().split('T')[0]
  ))].sort().reverse();

  let streak   = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const d of dates) {
    const logDate = new Date(d);
    logDate.setHours(0, 0, 0, 0);

    const diff = Math.round((expected - logDate) / 86400000);

    if (diff === 0 || diff === 1) {
      streak++;
      expected = new Date(logDate);
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
