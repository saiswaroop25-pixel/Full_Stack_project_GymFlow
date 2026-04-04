const { v4: uuidv4 } = require('uuid');

const subscriptions = new Map();
const memberNotes = new Map();
const workoutTemplates = new Map();
const savedMeals = new Map();
const mealPlans = new Map();
const payments = [];

const foodCatalog = [
  { id: 'food-oats', name: 'Rolled Oats', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, serving: '100 g', tags: ['breakfast', 'carbs'] },
  { id: 'food-eggs', name: 'Whole Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '100 g', tags: ['protein', 'breakfast'] },
  { id: 'food-chicken', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100 g', tags: ['protein', 'lean'] },
  { id: 'food-rice', name: 'Cooked Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100 g', tags: ['carbs', 'lunch'] },
  { id: 'food-paneer', name: 'Paneer', calories: 265, protein: 18.3, carbs: 3.4, fat: 20.8, serving: '100 g', tags: ['protein', 'veg'] },
  { id: 'food-banana', name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '100 g', tags: ['fruit', 'pre-workout'] },
  { id: 'food-yogurt', name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100 g', tags: ['protein', 'snack'] },
  { id: 'food-peanut-butter', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, serving: '100 g', tags: ['fats', 'snack'] },
];

const defaultTemplates = [
  {
    id: 'tpl-push',
    name: 'Push Day',
    goal: 'Strength & hypertrophy',
    exercises: [
      { name: 'Bench Press', muscleGroup: 'Chest', sets: [{ reps: 8, weight: 60 }, { reps: 8, weight: 60 }, { reps: 6, weight: 65 }] },
      { name: 'Shoulder Press', muscleGroup: 'Shoulders', sets: [{ reps: 10, weight: 20 }, { reps: 10, weight: 20 }, { reps: 8, weight: 22.5 }] },
      { name: 'Tricep Pushdown', muscleGroup: 'Triceps', sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
    ],
  },
  {
    id: 'tpl-legs',
    name: 'Leg Day',
    goal: 'Lower body focus',
    exercises: [
      { name: 'Squat', muscleGroup: 'Quads', sets: [{ reps: 6, weight: 80 }, { reps: 6, weight: 80 }, { reps: 5, weight: 85 }] },
      { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }] },
      { name: 'Leg Press', muscleGroup: 'Quads', sets: [{ reps: 12, weight: 140 }, { reps: 12, weight: 140 }] },
    ],
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSubscription(user) {
  const existing = subscriptions.get(user.id);
  if (existing) return existing;

  const subscription = {
    userId: user.id,
    plan: user.plan,
    status: 'active',
    startedAt: new Date().toISOString(),
    renewsAt: addDays(new Date(), 30).toISOString(),
    cancelAtPeriodEnd: false,
    provider: 'GymFlow Demo Billing',
    lastInvoiceAmount: planPrice(user.plan),
  };
  subscriptions.set(user.id, subscription);
  return subscription;
}

function setSubscription(userId, data) {
  const next = { ...(subscriptions.get(userId) || {}), ...data, userId };
  subscriptions.set(userId, next);
  return next;
}

function addPayment(entry) {
  const payment = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: 'paid',
    ...entry,
  };
  payments.unshift(payment);
  return payment;
}

function getPayments() {
  return clone(payments);
}

function getNotes(memberId) {
  return clone(memberNotes.get(memberId) || []);
}

function addNote(memberId, note) {
  const notes = memberNotes.get(memberId) || [];
  const entry = { id: uuidv4(), createdAt: new Date().toISOString(), ...note };
  notes.unshift(entry);
  memberNotes.set(memberId, notes);
  return entry;
}

function getTemplates(userId) {
  return clone(workoutTemplates.get(userId) || defaultTemplates);
}

function saveTemplate(userId, template) {
  const templates = workoutTemplates.get(userId) || clone(defaultTemplates);
  const entry = {
    id: template.id || uuidv4(),
    name: template.name,
    goal: template.goal || '',
    exercises: clone(template.exercises || []),
    createdAt: new Date().toISOString(),
  };
  const existingIndex = templates.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) templates[existingIndex] = entry;
  else templates.unshift(entry);
  workoutTemplates.set(userId, templates);
  return clone(entry);
}

function deleteTemplate(userId, templateId) {
  const templates = workoutTemplates.get(userId) || clone(defaultTemplates);
  const next = templates.filter((item) => item.id !== templateId);
  workoutTemplates.set(userId, next);
  return next.length !== templates.length;
}

function searchFoods(query = '') {
  const needle = query.trim().toLowerCase();
  if (!needle) return clone(foodCatalog.slice(0, 8));
  return clone(
    foodCatalog.filter((item) =>
      item.name.toLowerCase().includes(needle) || item.tags.some((tag) => tag.includes(needle))
    )
  );
}

function getSavedMeals(userId) {
  return clone(savedMeals.get(userId) || []);
}

function saveMeal(userId, meal) {
  const meals = savedMeals.get(userId) || [];
  const entry = {
    id: meal.id || uuidv4(),
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    items: clone(meal.items || []),
    createdAt: new Date().toISOString(),
  };
  meals.unshift(entry);
  savedMeals.set(userId, meals);
  return clone(entry);
}

function deleteSavedMeal(userId, mealId) {
  const meals = savedMeals.get(userId) || [];
  const next = meals.filter((item) => item.id !== mealId);
  savedMeals.set(userId, next);
  return next.length !== meals.length;
}

function getMealPlan(userId, weekKey) {
  const plans = mealPlans.get(userId) || {};
  return clone(plans[weekKey] || null);
}

function saveMealPlan(userId, weekKey, plan) {
  const plans = mealPlans.get(userId) || {};
  plans[weekKey] = {
    week: weekKey,
    updatedAt: new Date().toISOString(),
    days: clone(plan.days || []),
    notes: plan.notes || '',
  };
  mealPlans.set(userId, plans);
  return clone(plans[weekKey]);
}

function planPrice(plan) {
  return { BASIC: 299, PREMIUM: 599, STUDENT: 199, ANNUAL: 4999 }[plan] || 299;
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

module.exports = {
  addNote,
  addPayment,
  deleteSavedMeal,
  deleteTemplate,
  getMealPlan,
  getNotes,
  getPayments,
  getSavedMeals,
  getSubscription,
  getTemplates,
  planPrice,
  saveMeal,
  saveMealPlan,
  saveTemplate,
  searchFoods,
  setSubscription,
};
