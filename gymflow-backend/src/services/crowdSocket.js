/**
 * crowdSocket.js
 * Manages real-time crowd updates via Socket.IO.
 * Simulates realistic gym occupancy patterns by hour-of-day,
 * and persists snapshots to the DB every 5 minutes.
 */

// Realistic crowd curve by hour (0–23), as % of capacity
const CROWD_CURVE = [
  5, 3, 2, 2, 3, 10,   // 12AM–5AM (near-empty)
  35, 60, 55, 42, 38, 45, // 6AM–11AM (morning peak ~7AM)
  55, 48, 40, 38, 42, 58, // 12PM–5PM (lunch bump ~12PM)
  85, 92, 78, 62, 40, 22, // 6PM–11PM (evening peak ~7PM)
];

const CAPACITY = 200;

// Jitter ± a few percent each tick to feel real
function jitter(base, range = 6) {
  return Math.min(100, Math.max(0, base + Math.round((Math.random() - 0.5) * range * 2)));
}

function crowdLevel(pct) {
  if (pct < 40) return 'LOW';
  if (pct < 70) return 'MODERATE';
  return 'HIGH';
}

module.exports = function crowdSocket(io, prisma) {
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients++;
    console.log(`[Socket.IO] Client connected: ${socket.id} (total: ${connectedClients})`);

    // Send current crowd immediately on connect
    prisma.gymStats
      .findFirst({ orderBy: { timestamp: 'desc' } })
      .then(latest => {
        if (latest) socket.emit('crowd:update', latest);
      })
      .catch(() => {});

    socket.on('disconnect', () => {
      connectedClients--;
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (total: ${connectedClients})`);
    });
  });

  // ── Live simulation tick (every 30 seconds) ───────────────────────────────
  const TICK_MS = 30 * 1000;

  setInterval(() => {
    const hour    = new Date().getHours();
    const base    = CROWD_CURVE[hour];
    const pct     = jitter(base, 4);
    const checked = Math.round((pct / 100) * CAPACITY);
    const level   = crowdLevel(pct);

    const payload = {
      checkedIn:  checked,
      capacity:   CAPACITY,
      crowdPct:   pct,
      crowdLevel: level,
      timestamp:  new Date(),
    };

    if (connectedClients > 0) {
      io.emit('crowd:update', payload);
    }
  }, TICK_MS);

  // ── DB snapshot every 5 minutes ───────────────────────────────────────────
  const SNAPSHOT_MS = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const hour    = new Date().getHours();
      const base    = CROWD_CURVE[hour];
      const pct     = jitter(base, 4);
      const checked = Math.round((pct / 100) * CAPACITY);
      const level   = crowdLevel(pct);

      await prisma.gymStats.create({
        data: { checkedIn: checked, capacity: CAPACITY, crowdPct: pct, crowdLevel: level },
      });

      // Keep only last 7 days of snapshots to avoid table bloat
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      await prisma.gymStats.deleteMany({ where: { timestamp: { lt: cutoff } } });
    } catch (err) {
      console.error('[Socket.IO] DB snapshot error:', err.message);
    }
  }, SNAPSHOT_MS);

  console.log('[Socket.IO] Crowd simulation started (tick: 30s, snapshot: 5min)');
};
