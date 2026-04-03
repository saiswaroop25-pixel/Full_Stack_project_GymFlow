const jwt = require('jsonwebtoken');

// ── Verify JWT token ──────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const prisma = req.app?.get?.('prisma');

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, plan: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is no longer active.' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      };
    } else {
      req.user = decoded; // { id, email, role, plan }
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ── Admin only ────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// ── Optional auth (doesn't block if no token) ─────────────────────────────────
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      // ignore invalid token
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
