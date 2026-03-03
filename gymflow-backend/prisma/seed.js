const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GymFlow database...');

  // ── Clean existing data ──────────────────────────────────────────────────
  await prisma.exerciseSet.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.slotBooking.deleteMany();
  await prisma.attendanceLog.deleteMany();
  await prisma.gymStats.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin user ───────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gymflow.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'ANNUAL',
      goal: 'GENERAL_FITNESS',
    },
  });

  // ── Sample members ───────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('user123', 12);
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Arjun Mehta',   email: 'arjun@example.com',  password: userPassword, plan: 'PREMIUM', goal: 'MUSCLE_GAIN',   height: 178, weight: 75, targetWeight: 80 } }),
    prisma.user.create({ data: { name: 'Priya Sharma',  email: 'priya@example.com',  password: userPassword, plan: 'BASIC',   goal: 'FAT_LOSS',      height: 163, weight: 62, targetWeight: 55 } }),
    prisma.user.create({ data: { name: 'Rohan Verma',   email: 'rohan@example.com',  password: userPassword, plan: 'PREMIUM', goal: 'STRENGTH',      height: 182, weight: 88, targetWeight: 90 } }),
    prisma.user.create({ data: { name: 'Ananya Singh',  email: 'ananya@example.com', password: userPassword, plan: 'STUDENT', goal: 'ENDURANCE',     height: 160, weight: 55 } }),
    prisma.user.create({ data: { name: 'Vikram Nair',   email: 'vikram@example.com', password: userPassword, plan: 'ANNUAL',  goal: 'GENERAL_FITNESS', height: 175, weight: 82 } }),
  ]);

  const mainUser = users[0]; // Arjun — primary demo user

  // ── Workout logs for Arjun ────────────────────────────────────────────────
  const workouts = [
    { name: 'Push Day', duration: 62, calories: 380, volume: 4820,
      exercises: [
        { name: 'Bench Press',     muscleGroup: 'Chest',    sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 85 }, { reps: 6, weight: 90 }] },
        { name: 'Incline DB Press',muscleGroup: 'Chest',    sets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 32 }, { reps: 8, weight: 32 }] },
        { name: 'Shoulder Press',  muscleGroup: 'Shoulders',sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 55 }, { reps: 8, weight: 55 }] },
        { name: 'Tricep Pushdown', muscleGroup: 'Triceps',  sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 27 }, { reps: 10, weight: 27 }] },
      ]
    },
    { name: 'Pull Day', duration: 58, calories: 340, volume: 5120,
      exercises: [
        { name: 'Deadlift',       muscleGroup: 'Back',  sets: [{ reps: 5, weight: 120 }, { reps: 5, weight: 130 }, { reps: 3, weight: 140 }] },
        { name: 'Barbell Row',    muscleGroup: 'Back',  sets: [{ reps: 8, weight: 75 }, { reps: 8, weight: 80 }, { reps: 6, weight: 80 }] },
        { name: 'Lat Pulldown',   muscleGroup: 'Back',  sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 70 }, { reps: 8, weight: 70 }] },
      ]
    },
    { name: 'Leg Day', duration: 70, calories: 450, volume: 6200,
      exercises: [
        { name: 'Squat',              muscleGroup: 'Quads',     sets: [{ reps: 8, weight: 100 }, { reps: 8, weight: 105 }, { reps: 6, weight: 110 }] },
        { name: 'Romanian Deadlift',  muscleGroup: 'Hamstrings',sets: [{ reps: 10, weight: 80 }, { reps: 10, weight: 85 }, { reps: 8, weight: 85 }] },
        { name: 'Leg Press',          muscleGroup: 'Quads',     sets: [{ reps: 12, weight: 180 }, { reps: 12, weight: 190 }, { reps: 10, weight: 190 }] },
      ]
    },
  ];

  const dates = [new Date(Date.now() - 2*86400000), new Date(Date.now() - 4*86400000), new Date(Date.now() - 6*86400000)];

  for (let i = 0; i < workouts.length; i++) {
    const w = workouts[i];
    const log = await prisma.workoutLog.create({
      data: { userId: mainUser.id, name: w.name, date: dates[i], duration: w.duration, calories: w.calories, volume: w.volume },
    });
    let setNum = 1;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        await prisma.exerciseSet.create({
          data: { workoutLogId: log.id, name: ex.name, muscleGroup: ex.muscleGroup, setNumber: setNum++, reps: s.reps, weight: s.weight },
        });
      }
    }
  }

  // ── Meals for Arjun (today) ──────────────────────────────────────────────
  await prisma.meal.createMany({
    data: [
      { userId: mainUser.id, name: 'Breakfast', calories: 520, protein: 39, carbs: 92, fat: 8,
        items: [{ name: 'Oatmeal 100g', cal: 370 }, { name: 'Whey Protein', cal: 120 }, { name: 'Banana', cal: 89 }] },
      { userId: mainUser.id, name: 'Lunch', calories: 680, protein: 71, carbs: 52, fat: 10,
        items: [{ name: 'Chicken Breast 200g', cal: 330 }, { name: 'Brown Rice 150g', cal: 216 }, { name: 'Broccoli 100g', cal: 55 }] },
      { userId: mainUser.id, name: 'Pre-Workout', calories: 320, protein: 22, carbs: 62, fat: 8,
        items: [{ name: 'Greek Yogurt', cal: 130 }, { name: 'Oats 50g', cal: 185 }] },
    ],
  });

  // ── Slot bookings ─────────────────────────────────────────────────────────
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.slotBooking.create({
    data: { userId: mainUser.id, date: tomorrow, startTime: '10:00', endTime: '11:00', crowdPct: 38 },
  });

  // ── Attendance logs ───────────────────────────────────────────────────────
  for (let i = 1; i <= 5; i++) {
    const checkIn = new Date(Date.now() - i * 86400000);
    checkIn.setHours(7, 0, 0, 0);
    const checkOut = new Date(checkIn.getTime() + 65 * 60000);
    await prisma.attendanceLog.create({
      data: { userId: mainUser.id, checkIn, checkOut, duration: 65 },
    });
  }

  // ── Gym stats snapshots ────────────────────────────────────────────────────
  const crowdSnapshots = [
    { checkedIn: 45,  crowdPct: 23, crowdLevel: 'LOW' },
    { checkedIn: 134, crowdPct: 67, crowdLevel: 'MODERATE' },
    { checkedIn: 178, crowdPct: 89, crowdLevel: 'HIGH' },
    { checkedIn: 96,  crowdPct: 48, crowdLevel: 'MODERATE' },
    { checkedIn: 62,  crowdPct: 31, crowdLevel: 'LOW' },
  ];
  for (const s of crowdSnapshots) {
    await prisma.gymStats.create({ data: { ...s, capacity: 200 } });
  }

  // ── Equipment ─────────────────────────────────────────────────────────────
  await prisma.equipment.createMany({
    data: [
      { name: 'Treadmill #1',    type: 'Cardio',    status: 'OPERATIONAL', usageRate: 92, nextMaintDate: new Date('2024-02-15') },
      { name: 'Treadmill #2',    type: 'Cardio',    status: 'OPERATIONAL', usageRate: 78, nextMaintDate: new Date('2024-02-10') },
      { name: 'Treadmill #3',    type: 'Cardio',    status: 'MAINTENANCE', usageRate: 0,  nextMaintDate: new Date('2024-01-30') },
      { name: 'Squat Rack A',    type: 'Strength',  status: 'OPERATIONAL', usageRate: 85, nextMaintDate: new Date('2024-03-20') },
      { name: 'Squat Rack B',    type: 'Strength',  status: 'OPERATIONAL', usageRate: 72, nextMaintDate: new Date('2024-03-20') },
      { name: 'Bench Press A',   type: 'Strength',  status: 'OPERATIONAL', usageRate: 88, nextMaintDate: new Date('2024-03-18') },
      { name: 'Bench Press B',   type: 'Strength',  status: 'MAINTENANCE', usageRate: 0,  nextMaintDate: new Date('2024-01-28') },
      { name: 'Leg Press 1',     type: 'Strength',  status: 'OPERATIONAL', usageRate: 65, nextMaintDate: new Date('2024-04-22') },
      { name: 'Cable Machine',   type: 'Functional',status: 'OPERATIONAL', usageRate: 74, nextMaintDate: new Date('2024-04-25') },
      { name: 'Rowing Machine',  type: 'Cardio',    status: 'OPERATIONAL', usageRate: 48, nextMaintDate: new Date('2024-02-12') },
    ],
  });

  // ── Announcements ─────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { title: 'Peak Hour Alert – 6PM Warning', message: 'Gym is at 90% capacity. Visit after 9PM for open space.', type: 'alert', audience: 'All Members', reach: 1248 },
      { title: 'New Year Offer – 30% Off Annual Plans', message: 'Celebrate with a 30% discount on annual plan upgrades. Valid till Jan 31.', type: 'offer', audience: 'Basic Members', reach: 480 },
      { title: 'New Group Class: HIIT Bootcamp', message: 'Launching HIIT Bootcamp every Saturday at 7AM. Limited slots!', type: 'update', audience: 'Premium Members', reach: 520 },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('  Admin  → admin@gymflow.com  / admin123');
  console.log('  User   → arjun@example.com  / user123');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
