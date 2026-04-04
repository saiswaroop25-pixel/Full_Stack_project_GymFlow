require('dotenv').config();
const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const { Server }       = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const crowdSocket      = require('./services/crowdSocket');
const errorHandler     = require('./middleware/errorHandler');

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const workoutRoutes      = require('./routes/workouts');
const dietRoutes         = require('./routes/diet');
const slotRoutes         = require('./routes/slots');
const activityRoutes     = require('./routes/activity');
const crowdRoutes        = require('./routes/crowd');
const adminRoutes        = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscription');

// ── Init ─────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

['DATABASE_URL', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io + prisma available in routes via req
app.set('io', io);
app.set('prisma', prisma);

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  message:  { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GymFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet',     dietRoutes);
app.use('/api/slots',    slotRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/crowd',    crowdRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/subscription', subscriptionRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.IO crowd simulation ────────────────────────────────────────────────
crowdSocket(io, prisma);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log(`  ║   GymFlow API running on port ${PORT}   ║`);
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  ❤️   http://localhost:${PORT}/health`);
  console.log(`  📊  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
