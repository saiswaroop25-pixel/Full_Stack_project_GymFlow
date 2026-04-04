const { body, validationResult } = require('express-validator');
const {
  addPayment,
  getPayments: getStoredPayments,
  getSubscription: getStoredSubscription,
  planPrice,
  setSubscription,
} = require('../services/featureStore');

const PLANS = {
  BASIC: {
    code: 'BASIC',
    price: 299,
    cadence: 'monthly',
    features: ['Gym Access', 'Basic Analytics', 'Slot Booking'],
    badge: 'Starter',
  },
  PREMIUM: {
    code: 'PREMIUM',
    price: 599,
    cadence: 'monthly',
    features: ['Advanced Analytics', 'Diet Tools', 'Priority Slots', 'Coach-style insights'],
    badge: 'Most Popular',
  },
  STUDENT: {
    code: 'STUDENT',
    price: 199,
    cadence: 'monthly',
    features: ['Discounted Access', 'Workout Tracking', 'Slot Booking'],
    badge: 'Student',
  },
  ANNUAL: {
    code: 'ANNUAL',
    price: 4999,
    cadence: 'yearly',
    features: ['Premium Features', 'Best Savings', 'Priority Support'],
    badge: 'Best Value',
  },
};

exports.getPlans = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const [user, workoutCount, visitCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { plan: true, goal: true } }),
      prisma.workoutLog.count({ where: { userId: req.user.id } }),
      prisma.attendanceLog.count({ where: { userId: req.user.id } }),
    ]);

    const recommendation =
      visitCount >= 12 || workoutCount >= 10 ? 'PREMIUM' : user?.goal === 'GENERAL_FITNESS' ? 'BASIC' : 'STUDENT';

    res.json({
      success: true,
      data: {
        currentPlan: user?.plan || req.user.plan,
        recommendation,
        plans: Object.values(PLANS),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMySubscription = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    });
    const subscription = getStoredSubscription({ id: user.id, plan: user.plan });
    const payments = getStoredPayments().filter((payment) => payment.userId === req.user.id).slice(0, 6);

    res.json({
      success: true,
      data: {
        user,
        subscription: { ...subscription, plan: user.plan },
        payments,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const prisma = req.app.get('prisma');
    const { plan } = req.body;
    const selectedPlan = PLANS[plan];

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { plan },
      select: { id: true, name: true, email: true, plan: true },
    });

    const subscription = setSubscription(user.id, {
      plan,
      status: 'active',
      startedAt: new Date().toISOString(),
      renewsAt: new Date(Date.now() + (plan === 'ANNUAL' ? 365 : 30) * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      provider: 'GymFlow Demo Billing',
      lastInvoiceAmount: planPrice(plan),
    });

    const payment = addPayment({
      userId: user.id,
      memberName: user.name,
      email: user.email,
      plan,
      amount: selectedPlan.price,
      provider: 'GymFlow Demo Billing',
      reference: `GF-${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      message: `${plan} plan activated successfully.`,
      data: {
        user,
        subscription,
        payment,
        checkoutUrl: `/app/profile?plan=${plan.toLowerCase()}&status=success`,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, plan: true },
    });
    const subscription = getStoredSubscription({ id: user.id, plan: user.plan });
    const updated = setSubscription(user.id, {
      ...subscription,
      cancelAtPeriodEnd: true,
      status: 'active',
    });

    res.json({
      success: true,
      message: 'Cancellation scheduled for the end of the current billing period.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    res.json({ success: true, data: getStoredPayments().slice(0, 50) });
  } catch (err) {
    next(err);
  }
};

exports.checkoutValidators = [
  body('plan').isIn(Object.keys(PLANS)).withMessage('Please choose a valid membership plan.'),
];
