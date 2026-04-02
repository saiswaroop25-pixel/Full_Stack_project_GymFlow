exports.getAttendance = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));

    const logs = await prisma.attendanceLog.findMany({
      where: { userId: req.user.id, checkIn: { gte: since } },
      orderBy: { checkIn: 'desc' },
    });

    const activeSession = await prisma.attendanceLog.findFirst({
      where: { userId: req.user.id, checkOut: null },
    });

    const streak = calcStreak(logs);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const visitsThisMonth = logs.filter((log) => new Date(log.checkIn) >= monthStart).length;
    const logsWithDuration = logs.filter((log) => log.duration);
    const avgDuration = logsWithDuration.length
      ? Math.round(logsWithDuration.reduce((sum, log) => sum + log.duration, 0) / logsWithDuration.length)
      : 0;

    res.json({
      success: true,
      data: {
        logs,
        isCheckedIn: Boolean(activeSession),
        activeSession,
        streak,
        visitsThisMonth,
        totalVisits: logs.length,
        avgDuration,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const today = new Date();
    const tomorrow = new Date();
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(23, 59, 59, 999);

    const [user, todayWorkouts, todayAttendance] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { goal: true },
      }),
      prisma.workoutLog.findMany({
        where: { userId: req.user.id, date: { gte: today, lte: tomorrow } },
      }),
      prisma.attendanceLog.findMany({
        where: { userId: req.user.id, checkIn: { gte: today, lte: tomorrow } },
        orderBy: { checkIn: 'asc' },
      }),
    ]);

    const totalCalories = todayWorkouts.reduce((sum, workout) => sum + (workout.calories || 0), 0);
    const workoutMinutes = todayWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    const attendanceMinutes = todayAttendance.reduce((sum, log) => {
      if (log.duration) return sum + log.duration;
      if (!log.checkOut) return sum + Math.max(0, Math.round((Date.now() - new Date(log.checkIn)) / 60000));
      return sum;
    }, 0);
    const activeMinutes = Math.max(workoutMinutes, attendanceMinutes);

    const visitBonus = todayAttendance.length * 1200;
    const calorieContribution = totalCalories * 11;
    const durationContribution = activeMinutes * 45;
    const steps = Math.round(Math.min(20000, visitBonus + calorieContribution + durationContribution));

    const stepsGoal = getStepsGoal(user?.goal);

    res.json({
      success: true,
      data: {
        date: today,
        workoutsToday: todayWorkouts.length,
        caloriesBurned: totalCalories,
        activeMinutes,
        steps,
        stepsGoal,
      },
    });
  } catch (err) {
    next(err);
  }
};

function calcStreak(logs) {
  if (!logs.length) return 0;

  const dates = [...new Set(logs.map((log) => new Date(log.checkIn).toISOString().split('T')[0]))]
    .sort()
    .reverse();

  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const dateValue of dates) {
    const logDate = new Date(dateValue);
    logDate.setHours(0, 0, 0, 0);

    const diff = Math.round((expected - logDate) / 86400000);
    if (diff === 0 || diff === 1) {
      streak += 1;
      expected = new Date(logDate);
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getStepsGoal(goal) {
  const goals = {
    FAT_LOSS: 12000,
    ENDURANCE: 14000,
    STRENGTH: 9000,
    MUSCLE_GAIN: 10000,
    GENERAL_FITNESS: 10000,
  };

  return goals[goal] || 10000;
}
