const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── Helper: strip password from user object ───────────────────────────────────
const sanitize = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const parseOptionalFloat = (value) => {
  if (value === '' || value === null) return null;
  if (value === undefined) return undefined;
  return parseFloat(value);
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, email, password, goal, height, weight, plan } = req.body;

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        goal:   goal   || 'GENERAL_FITNESS',
        plan:   plan   || 'BASIC',
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
      },
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: sanitize(user),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitize(user),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        plan: true, goal: true, height: true, weight: true,
        targetWeight: true, bodyFat: true, phone: true,
        avatar: true, isActive: true, createdAt: true,
        _count: { select: { workoutLogs: true, meals: true, slotBookings: true } },
      },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, goal, height, weight, targetWeight, bodyFat, phone } = req.body;

    const data = {};
    if (hasOwn(req.body, 'name')) data.name = name;
    if (hasOwn(req.body, 'goal')) data.goal = goal;

    const parsedHeight = parseOptionalFloat(height);
    if (parsedHeight !== undefined) data.height = parsedHeight;

    const parsedWeight = parseOptionalFloat(weight);
    if (parsedWeight !== undefined) data.weight = parsedWeight;

    const parsedTargetWeight = parseOptionalFloat(targetWeight);
    if (parsedTargetWeight !== undefined) data.targetWeight = parsedTargetWeight;

    const parsedBodyFat = parseOptionalFloat(bodyFat);
    if (parsedBodyFat !== undefined) data.bodyFat = parsedBodyFat;

    if (hasOwn(req.body, 'phone')) data.phone = phone || null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ success: true, message: 'Profile updated.', user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/auth/password ──────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};
