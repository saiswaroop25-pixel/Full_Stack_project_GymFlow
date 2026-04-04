const {
  deleteTemplate: removeStoredTemplate,
  getTemplates: getStoredTemplates,
  saveTemplate,
} = require('../services/featureStore');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

exports.getLogs = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { page = 1, limit = 10, from, to } = req.query;

    const where = {
      userId: req.user.id,
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      prisma.workoutLog.findMany({
        where,
        include: { exercises: { orderBy: { setNumber: 'asc' } } },
        orderBy: { date: 'desc' },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      prisma.workoutLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
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

exports.getLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const log = await prisma.workoutLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { exercises: { orderBy: { setNumber: 'asc' } } },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

exports.createLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, date, duration, calories, notes, exercises } = req.body;

    let volume = 0;
    if (Array.isArray(exercises)) {
      exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          volume += set.reps * set.weight;
        });
      });
    }

    const log = await prisma.workoutLog.create({
      data: {
        userId: req.user.id,
        name,
        date: date ? new Date(date) : new Date(),
        duration: parseInt(duration, 10),
        calories: calories ? parseInt(calories, 10) : null,
        notes,
        volume,
        exercises: {
          create:
            exercises?.flatMap((exercise) =>
              exercise.sets.map((set, setIndex) => ({
                name: exercise.name,
                muscleGroup: exercise.muscleGroup || null,
                setNumber: setIndex + 1,
                reps: parseInt(set.reps, 10),
                weight: parseFloat(set.weight),
                rpe: set.rpe ? parseInt(set.rpe, 10) : null,
              }))
            ) || [],
        },
      },
      include: { exercises: true },
    });

    res.status(201).json({ success: true, message: 'Workout logged.', data: log });
  } catch (err) {
    next(err);
  }
};

exports.updateLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, duration, calories, notes } = req.body;

    const log = await prisma.workoutLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    const data = {};
    if (hasOwn(req.body, 'name')) data.name = name;
    if (hasOwn(req.body, 'duration')) data.duration = parseInt(duration, 10);
    if (hasOwn(req.body, 'calories')) data.calories = calories === '' || calories === null ? null : parseInt(calories, 10);
    if (hasOwn(req.body, 'notes')) data.notes = notes;

    const updated = await prisma.workoutLog.update({
      where: { id: req.params.id },
      data,
      include: { exercises: true },
    });

    res.json({ success: true, message: 'Workout updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteLog = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const log = await prisma.workoutLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    await prisma.workoutLog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workout deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { weeks = 8 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(weeks, 10) * 7);

    const logs = await prisma.workoutLog.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      include: { exercises: true },
      orderBy: { date: 'asc' },
    });

    const allSets = await prisma.exerciseSet.findMany({
      where: { workoutLog: { userId: req.user.id } },
      include: { workoutLog: { select: { date: true } } },
    });

    const prMap = {};
    allSets.forEach((set) => {
      if (!prMap[set.name] || set.weight > prMap[set.name].weight) {
        prMap[set.name] = { weight: set.weight, date: set.workoutLog.date };
      }
    });
    const prs = Object.entries(prMap).map(([exercise, data]) => ({ exercise, ...data }));

    const volumeByWeek = {};
    logs.forEach((log) => {
      const weekKey = getWeekLabel(log.date);
      volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + (log.volume || 0);
    });

    const muscleCounts = {};
    allSets.forEach((set) => {
      if (set.muscleGroup) {
        muscleCounts[set.muscleGroup] = (muscleCounts[set.muscleGroup] || 0) + 1;
      }
    });

    const totalSets = Object.values(muscleCounts).reduce((sum, count) => sum + count, 0);
    const muscleDistribution = Object.entries(muscleCounts).map(([name, count]) => ({
      name,
      value: totalSets ? Math.round((count / totalSets) * 100) : 0,
    }));

    const topLifts = ['Bench Press', 'Squat', 'Deadlift'];
    const strengthProgress = [];
    const weekGroups = {};

    allSets
      .filter((set) => topLifts.includes(set.name))
      .forEach((set) => {
        const weekKey = getWeekLabel(set.workoutLog.date);
        if (!weekGroups[weekKey]) weekGroups[weekKey] = {};

        const liftKey = set.name.toLowerCase().replace(' ', '');
        if (!weekGroups[weekKey][liftKey] || set.weight > weekGroups[weekKey][liftKey]) {
          weekGroups[weekKey][liftKey] = set.weight;
        }
      });

    Object.entries(weekGroups).forEach(([week, lifts]) => {
      strengthProgress.push({
        week,
        bench: lifts.benchpress || 0,
        squat: lifts.squat || 0,
        deadlift: lifts.deadlift || 0,
      });
    });

    res.json({
      success: true,
      data: {
        totalWorkouts: logs.length,
        totalVolume: logs.reduce((sum, log) => sum + (log.volume || 0), 0),
        totalDuration: logs.reduce((sum, log) => sum + log.duration, 0),
        avgDuration: logs.length
          ? Math.round(logs.reduce((sum, log) => sum + log.duration, 0) / logs.length)
          : 0,
        prs,
        muscleDistribution,
        volumeByWeek: Object.entries(volumeByWeek).map(([week, volume]) => ({ week, volume })),
        strengthProgress,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    res.json({ success: true, data: getStoredTemplates(req.user.id) });
  } catch (err) {
    next(err);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const template = saveTemplate(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Template saved.', data: template });
  } catch (err) {
    next(err);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const deleted = removeStoredTemplate(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    res.json({ success: true, message: 'Template deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.useTemplate = async (req, res, next) => {
  try {
    const template = getStoredTemplates(req.user.id).find((item) => item.id === req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

exports.getExerciseHistory = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Exercise name is required.' });
    }

    const sets = await prisma.exerciseSet.findMany({
      where: {
        workoutLog: { userId: req.user.id },
        name: { equals: name, mode: 'insensitive' },
      },
      include: {
        workoutLog: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
      },
      orderBy: { workoutLog: { date: 'desc' } },
      take: 20,
    });

    const bestSet = sets.reduce((best, set) => (!best || set.weight > best.weight ? set : best), null);

    res.json({
      success: true,
      data: {
        name,
        bestSet,
        history: sets.map((set) => ({
          id: set.id,
          date: set.workoutLog.date,
          workout: set.workoutLog.name,
          reps: set.reps,
          weight: set.weight,
          setNumber: set.setNumber,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

function getWeekLabel(date) {
  const target = new Date(date);
  const weekStart = new Date(target);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  return weekStart.toISOString().split('T')[0];
}
