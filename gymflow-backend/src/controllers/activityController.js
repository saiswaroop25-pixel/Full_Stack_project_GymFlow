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

exports.getNotifications = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const today = startOfDay(new Date());
    const allowedAudiences = getAllowedAudiences(req.user.plan);

    const [announcements, bookings, workouts, latestCrowd] = await Promise.all([
      prisma.announcement.findMany({
        where: { audience: { in: allowedAudiences } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.slotBooking.findMany({
        where: {
          userId: req.user.id,
          status: 'BOOKED',
          date: { gte: today },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 5,
      }),
      prisma.workoutLog.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          date: true,
          duration: true,
          calories: true,
          volume: true,
        },
      }),
      prisma.gymStats.findFirst({ orderBy: { timestamp: 'desc' } }),
    ]);

    const notifications = [
      ...announcements.map((announcement) => ({
        id: `announcement:${announcement.id}`,
        type: announcement.type || 'update',
        title: announcement.title,
        body: announcement.message,
        createdAt: announcement.createdAt,
      })),
      ...bookings.map((booking) => ({
        id: `slot:${booking.id}`,
        type: 'slot',
        title: 'Upcoming booking confirmed',
        body: `Your ${formatDate(booking.date)} slot at ${booking.startTime}-${booking.endTime} is reserved.`,
        createdAt: booking.createdAt,
      })),
      ...workouts.map((workout) => ({
        id: `workout:${workout.id}`,
        type: 'workout',
        title: `${workout.name} logged`,
        body: buildWorkoutMessage(workout),
        createdAt: workout.date,
      })),
    ];

    if (latestCrowd) {
      notifications.push({
        id: `crowd:${latestCrowd.id}`,
        type: latestCrowd.crowdPct >= 75 ? 'alert' : 'crowd',
        title: latestCrowd.crowdPct >= 75 ? 'Peak-hour crowd alert' : 'Current gym crowd update',
        body:
          latestCrowd.crowdPct >= 75
            ? `The gym is currently at ${latestCrowd.crowdPct}% capacity. A later slot may feel less crowded.`
            : `The latest snapshot shows the gym at ${latestCrowd.crowdPct}% capacity.`,
        createdAt: latestCrowd.timestamp,
      });
    }

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: notifications.slice(0, 20) });
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

function getAllowedAudiences(plan) {
  const allowedByPlan = {
    BASIC: ['All Members', 'Basic Members'],
    PREMIUM: ['All Members', 'Premium Members'],
    STUDENT: ['All Members', 'Student Members'],
    ANNUAL: ['All Members', 'Annual Members'],
  };

  return allowedByPlan[plan] || ['All Members'];
}

function buildWorkoutMessage(workout) {
  const bits = [`${workout.duration} min session`];

  if (workout.calories) {
    bits.push(`${workout.calories} kcal burned`);
  }

  if (workout.volume) {
    bits.push(`${Math.round(workout.volume).toLocaleString('en-IN')} kg volume`);
  }

  return bits.join(' · ');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
