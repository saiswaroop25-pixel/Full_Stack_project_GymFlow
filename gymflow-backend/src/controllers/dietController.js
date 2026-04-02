const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

exports.getMeals = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate);
    const end = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const meals = await prisma.meal.findMany({
      where: { userId: req.user.id, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ success: true, data: meals, totals });
  } catch (err) {
    next(err);
  }
};

exports.getMeal = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const meal = await prisma.meal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found.' });
    }

    res.json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

exports.createMeal = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, date, calories, protein, carbs, fat, items } = req.body;

    const meal = await prisma.meal.create({
      data: {
        userId: req.user.id,
        name,
        date: date ? new Date(date) : new Date(),
        calories: parseInt(calories, 10),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        items: items || [],
      },
    });

    res.status(201).json({ success: true, message: 'Meal logged.', data: meal });
  } catch (err) {
    next(err);
  }
};

exports.updateMeal = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const meal = await prisma.meal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found.' });
    }

    const { name, calories, protein, carbs, fat, items } = req.body;
    const data = {};

    if (hasOwn(req.body, 'name')) data.name = name;
    if (hasOwn(req.body, 'calories')) data.calories = parseInt(calories, 10);
    if (hasOwn(req.body, 'protein')) data.protein = parseFloat(protein);
    if (hasOwn(req.body, 'carbs')) data.carbs = parseFloat(carbs);
    if (hasOwn(req.body, 'fat')) data.fat = parseFloat(fat);
    if (hasOwn(req.body, 'items')) data.items = items || [];

    const updated = await prisma.meal.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, message: 'Meal updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const meal = await prisma.meal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found.' });
    }

    await prisma.meal.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Meal deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { days = 7 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));
    since.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    const byDay = {};
    meals.forEach((meal) => {
      const dayKey = meal.date.toISOString().split('T')[0];
      if (!byDay[dayKey]) {
        byDay[dayKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      }

      byDay[dayKey].calories += meal.calories;
      byDay[dayKey].protein += meal.protein;
      byDay[dayKey].carbs += meal.carbs;
      byDay[dayKey].fat += meal.fat;
      byDay[dayKey].meals += 1;
    });

    const dailySummary = Object.entries(byDay).map(([date, data]) => ({
      date,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      ...data,
    }));

    const totalDays = dailySummary.length || 1;
    const avgCalories = Math.round(dailySummary.reduce((sum, day) => sum + day.calories, 0) / totalDays);
    const avgProtein = Math.round(dailySummary.reduce((sum, day) => sum + day.protein, 0) / totalDays);

    res.json({
      success: true,
      data: {
        dailySummary,
        averages: { calories: avgCalories, protein: avgProtein },
        totalMealsLogged: meals.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMacroGoals = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const weight = user.weight || 75;
    const goals = calculateMacroGoals(weight, user.goal);

    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
};

function calculateMacroGoals(weightKg, goal) {
  const baseTDEE = weightKg * 33;

  const configs = {
    MUSCLE_GAIN: { calMult: 1.1, proteinPerKg: 2.2, carbPct: 0.45, fatPct: 0.25 },
    FAT_LOSS: { calMult: 0.8, proteinPerKg: 2.4, carbPct: 0.3, fatPct: 0.3 },
    STRENGTH: { calMult: 1.05, proteinPerKg: 2.0, carbPct: 0.4, fatPct: 0.3 },
    ENDURANCE: { calMult: 1.15, proteinPerKg: 1.6, carbPct: 0.55, fatPct: 0.25 },
    GENERAL_FITNESS: { calMult: 1.0, proteinPerKg: 1.8, carbPct: 0.45, fatPct: 0.3 },
  };

  const config = configs[goal] || configs.GENERAL_FITNESS;
  const calories = Math.round(baseTDEE * config.calMult);
  const protein = Math.round(weightKg * config.proteinPerKg);
  const fat = Math.round((calories * config.fatPct) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}
