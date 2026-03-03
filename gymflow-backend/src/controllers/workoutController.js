// ── GET /api/workouts ─────────────────────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { page = 1, limit = 10, from, to } = req.query;

    const where = {
      userId: req.user.id,
      ...(from || to ? {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to   && { lte: new Date(to) }),
        },
      } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.workoutLog.findMany({
        where,
        include: { exercises: { orderBy: { setNumber: 'asc' } } },
        orderBy: { date: 'desc' },
        skip:  (parseInt(page) - 1) * parseInt(limit),
        take:  parseInt(limit),
      }),
      prisma.workoutLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// ── GET /api/workouts/:id ─────────────────────────────────────────────────────
exports.getLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const log = await prisma.workoutLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { exercises: { orderBy: { setNumber: 'asc' } } },
    });
    if (!log) return res.status(404).json({ success: false, message: 'Workout not found.' });
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

// ── POST /api/workouts ────────────────────────────────────────────────────────
exports.createLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, date, duration, calories, notes, exercises } = req.body;

    // Compute total volume
    let volume = 0;
    if (exercises && Array.isArray(exercises)) {
      exercises.forEach(ex => {
        ex.sets.forEach(s => { volume += s.reps * s.weight; });
      });
    }

    const log = await prisma.workoutLog.create({
      data: {
        userId:   req.user.id,
        name,
        date:     date ? new Date(date) : new Date(),
        duration: parseInt(duration),
        calories: calories ? parseInt(calories) : null,
        notes,
        volume,
        exercises: {
          create: exercises?.flatMap((ex, exIdx) =>
            ex.sets.map((s, sIdx) => ({
              name:        ex.name,
              muscleGroup: ex.muscleGroup || null,
              setNumber:   sIdx + 1,
              reps:        parseInt(s.reps),
              weight:      parseFloat(s.weight),
              rpe:         s.rpe ? parseInt(s.rpe) : null,
            }))
          ) || [],
        },
      },
      include: { exercises: true },
    });

    res.status(201).json({ success: true, message: 'Workout logged.', data: log });
  } catch (err) { next(err); }
};

// ── PATCH /api/workouts/:id ───────────────────────────────────────────────────
exports.updateLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, duration, calories, notes } = req.body;

    const log = await prisma.workoutLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ success: false, message: 'Workout not found.' });

    const updated = await prisma.workoutLog.update({
      where: { id: req.params.id },
      data: {
        ...(name     && { name }),
        ...(duration && { duration: parseInt(duration) }),
        ...(calories && { calories: parseInt(calories) }),
        ...(notes !== undefined && { notes }),
      },
      include: { exercises: true },
    });

    res.json({ success: true, message: 'Workout updated.', data: updated });
  } catch (err) { next(err); }
};

// ── DELETE /api/workouts/:id ──────────────────────────────────────────────────
exports.deleteLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const log = await prisma.workoutLog.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ success: false, message: 'Workout not found.' });

    await prisma.workoutLog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workout deleted.' });
  } catch (err) { next(err); }
};

// ── GET /api/workouts/analytics/summary ───────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { weeks = 8 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(weeks) * 7);

    const logs = await prisma.workoutLog.findMany({
      where:   { userId: req.user.id, date: { gte: since } },
      include: { exercises: true },
      orderBy: { date: 'asc' },
    });

    // ── Personal Records (max weight per exercise) ────────────────────────────
    const allSets = await prisma.exerciseSet.findMany({
      where:   { workoutLog: { userId: req.user.id } },
      include: { workoutLog: { select: { date: true } } },
    });
    const prMap = {};
    allSets.forEach(s => {
      if (!prMap[s.name] || s.weight > prMap[s.name].weight) {
        prMap[s.name] = { weight: s.weight, date: s.workoutLog.date };
      }
    });
    const prs = Object.entries(prMap).map(([exercise, data]) => ({ exercise, ...data }));

    // ── Weekly volume ─────────────────────────────────────────────────────────
    const volumeByWeek = {};
    logs.forEach(log => {
      const weekKey = getWeekLabel(log.date);
      volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + (log.volume || 0);
    });

    // ── Muscle distribution ───────────────────────────────────────────────────
    const muscleCounts = {};
    allSets.forEach(s => {
      if (s.muscleGroup) muscleCounts[s.muscleGroup] = (muscleCounts[s.muscleGroup] || 0) + 1;
    });
    const totalSets = Object.values(muscleCounts).reduce((a, b) => a + b, 0);
    const muscleDistribution = Object.entries(muscleCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / totalSets) * 100),
    }));

    // ── Strength progress (top 3 lifts) ───────────────────────────────────────
    const topLifts = ['Bench Press', 'Squat', 'Deadlift'];
    const strengthProgress = [];
    const weekGroups = {};
    allSets
      .filter(s => topLifts.includes(s.name))
      .forEach(s => {
        const wk = getWeekLabel(s.workoutLog.date);
        if (!weekGroups[wk]) weekGroups[wk] = {};
        const key = s.name.toLowerCase().replace(' ', '');
        if (!weekGroups[wk][key] || s.weight > weekGroups[wk][key]) {
          weekGroups[wk][key] = s.weight;
        }
      });
    Object.entries(weekGroups).forEach(([week, lifts]) => {
      strengthProgress.push({ week, bench: lifts.benchpress || 0, squat: lifts.squat || 0, deadlift: lifts.deadlift || 0 });
    });

    res.json({
      success: true,
      data: {
        totalWorkouts: logs.length,
        totalVolume:   logs.reduce((a, l) => a + (l.volume || 0), 0),
        totalDuration: logs.reduce((a, l) => a + l.duration, 0),
        avgDuration:   logs.length ? Math.round(logs.reduce((a, l) => a + l.duration, 0) / logs.length) : 0,
        prs,
        muscleDistribution,
        volumeByWeek: Object.entries(volumeByWeek).map(([week, volume]) => ({ week, volume })),
        strengthProgress,
      },
    });
  } catch (err) { next(err); }
};

function getWeekLabel(date) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `W${week}`;
}
