export const crowdData = {
  current: 67,
  status: 'moderate',
  checkedIn: 134,
  capacity: 200,
  peakToday: 85,
  avgToday: 58,
  hourly: [
    { hour: '6AM', crowd: 45 }, { hour: '7AM', crowd: 72 }, { hour: '8AM', crowd: 85 },
    { hour: '9AM', crowd: 60 }, { hour: '10AM', crowd: 42 }, { hour: '11AM', crowd: 38 },
    { hour: '12PM', crowd: 55 }, { hour: '1PM', crowd: 48 }, { hour: '2PM', crowd: 35 },
    { hour: '3PM', crowd: 40 }, { hour: '4PM', crowd: 62 }, { hour: '5PM', crowd: 88 },
    { hour: '6PM', crowd: 95 }, { hour: '7PM', crowd: 78 }, { hour: '8PM', crowd: 55 },
    { hour: '9PM', crowd: 30 },
  ],
  weekly: [
    { day: 'Mon', avg: 62 }, { day: 'Tue', avg: 55 }, { day: 'Wed', avg: 70 },
    { day: 'Thu', avg: 48 }, { day: 'Fri', avg: 80 }, { day: 'Sat', avg: 90 },
    { day: 'Sun', avg: 40 },
  ],
  zones: [
    { name: 'Free Weights', pct: 85, status: 'high' },
    { name: 'Cardio Floor', pct: 60, status: 'moderate' },
    { name: 'Machines Area', pct: 45, status: 'low' },
    { name: 'Stretching Zone', pct: 20, status: 'low' },
    { name: 'Group Classes', pct: 70, status: 'moderate' },
    { name: 'Swimming Pool', pct: 55, status: 'moderate' },
  ],
};

export const workoutLogs = [
  {
    id: 1, date: '2024-01-28', name: 'Push Day', duration: 62, calories: 380,
    exercises: [
      { name: 'Bench Press', sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 85 }, { reps: 6, weight: 90 }] },
      { name: 'Incline DB Press', sets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 30 }, { reps: 8, weight: 32 }] },
      { name: 'Shoulder Press', sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 55 }, { reps: 8, weight: 55 }] },
      { name: 'Tricep Pushdown', sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 27 }, { reps: 10, weight: 27 }] },
    ],
    volume: 4820, muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
  },
  {
    id: 2, date: '2024-01-26', name: 'Pull Day', duration: 58, calories: 340,
    exercises: [
      { name: 'Deadlift', sets: [{ reps: 5, weight: 120 }, { reps: 5, weight: 130 }, { reps: 3, weight: 140 }] },
      { name: 'Barbell Row', sets: [{ reps: 8, weight: 75 }, { reps: 8, weight: 80 }, { reps: 6, weight: 80 }] },
      { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 70 }, { reps: 8, weight: 70 }] },
    ],
    volume: 5120, muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
  },
  {
    id: 3, date: '2024-01-24', name: 'Leg Day', duration: 70, calories: 450,
    exercises: [
      { name: 'Squat', sets: [{ reps: 8, weight: 100 }, { reps: 8, weight: 105 }, { reps: 6, weight: 110 }] },
      { name: 'Romanian Deadlift', sets: [{ reps: 10, weight: 80 }, { reps: 10, weight: 85 }, { reps: 8, weight: 85 }] },
      { name: 'Leg Press', sets: [{ reps: 12, weight: 180 }, { reps: 12, weight: 190 }, { reps: 10, weight: 190 }] },
    ],
    volume: 6200, muscleGroups: ['Quads', 'Hamstrings', 'Glutes'],
  },
];

export const progressData = {
  strengthProgress: [
    { week: 'W1', bench: 75, squat: 90, deadlift: 110 },
    { week: 'W2', bench: 77, squat: 95, deadlift: 115 },
    { week: 'W3', bench: 80, squat: 98, deadlift: 120 },
    { week: 'W4', bench: 82, squat: 100, deadlift: 125 },
    { week: 'W5', bench: 85, squat: 102, deadlift: 130 },
    { week: 'W6', bench: 87, squat: 105, deadlift: 135 },
    { week: 'W7', bench: 90, squat: 108, deadlift: 140 },
    { week: 'W8', bench: 90, squat: 110, deadlift: 140 },
  ],
  volumeByWeek: [
    { week: 'W1', volume: 18000 }, { week: 'W2', volume: 20500 },
    { week: 'W3', volume: 22000 }, { week: 'W4', volume: 19800 },
    { week: 'W5', volume: 24000 }, { week: 'W6', volume: 25500 },
    { week: 'W7', volume: 23000 }, { week: 'W8', volume: 26800 },
  ],
  prs: [
    { exercise: 'Bench Press', weight: 90, date: '2024-01-28' },
    { exercise: 'Squat', weight: 110, date: '2024-01-24' },
    { exercise: 'Deadlift', weight: 140, date: '2024-01-26' },
    { exercise: 'Overhead Press', weight: 65, date: '2024-01-22' },
  ],
  muscleDistribution: [
    { name: 'Chest', value: 28 }, { name: 'Back', value: 25 },
    { name: 'Legs', value: 22 }, { name: 'Shoulders', value: 12 },
    { name: 'Arms', value: 9 }, { name: 'Core', value: 4 },
  ],
};

export const dietData = {
  today: { calories: 2180, protein: 178, carbs: 240, fat: 65 },
  goals: { calories: 2500, protein: 200, carbs: 280, fat: 70 },
  meals: [
    {
      id: 1, name: 'Breakfast', time: '08:00', calories: 520,
      items: [
        { name: 'Oatmeal (100g)', cal: 370, protein: 13, carbs: 66, fat: 7 },
        { name: 'Whey Protein', cal: 120, protein: 25, carbs: 3, fat: 1 },
        { name: 'Banana', cal: 89, protein: 1, carbs: 23, fat: 0 },
      ],
    },
    {
      id: 2, name: 'Lunch', time: '13:00', calories: 680,
      items: [
        { name: 'Chicken Breast (200g)', cal: 330, protein: 62, carbs: 0, fat: 7 },
        { name: 'Brown Rice (150g)', cal: 216, protein: 5, carbs: 45, fat: 2 },
        { name: 'Broccoli (100g)', cal: 55, protein: 4, carbs: 7, fat: 1 },
      ],
    },
    {
      id: 3, name: 'Pre-Workout', time: '17:00', calories: 320,
      items: [
        { name: 'Greek Yogurt', cal: 130, protein: 15, carbs: 9, fat: 4 },
        { name: 'Mixed Berries', cal: 85, protein: 1, carbs: 20, fat: 0 },
        { name: 'Oats (50g)', cal: 185, protein: 6, carbs: 33, fat: 4 },
      ],
    },
    {
      id: 4, name: 'Post-Workout', time: '19:30', calories: 480,
      items: [
        { name: 'Whey Protein Shake', cal: 150, protein: 30, carbs: 5, fat: 2 },
        { name: 'Whole Grain Pasta (200g)', cal: 280, protein: 12, carbs: 55, fat: 3 },
      ],
    },
  ],
  weeklyCalories: [
    { day: 'Mon', cal: 2380, goal: 2500 }, { day: 'Tue', cal: 2510, goal: 2500 },
    { day: 'Wed', cal: 2290, goal: 2500 }, { day: 'Thu', cal: 2600, goal: 2500 },
    { day: 'Fri', cal: 2450, goal: 2500 }, { day: 'Sat', cal: 2180, goal: 2500 },
    { day: 'Sun', cal: 2180, goal: 2500 },
  ],
};

export const activityData = {
  today: { steps: 8420, calories: 380, activeMinutes: 65, distance: 6.2 },
  goals: { steps: 10000, calories: 500, activeMinutes: 90, distance: 8 },
  weeklySteps: [
    { day: 'Mon', steps: 9200 }, { day: 'Tue', steps: 7800 },
    { day: 'Wed', steps: 11200 }, { day: 'Thu', steps: 6500 },
    { day: 'Fri', steps: 8900 }, { day: 'Sat', steps: 5200 },
    { day: 'Sun', steps: 8420 },
  ],
};

export const slots = [
  { id: 1, time: '06:00 – 07:00', crowd: 35, status: 'available', booked: false },
  { id: 2, time: '07:00 – 08:00', crowd: 72, status: 'moderate', booked: false },
  { id: 3, time: '08:00 – 09:00', crowd: 90, status: 'busy', booked: false },
  { id: 4, time: '10:00 – 11:00', crowd: 38, status: 'available', booked: true },
  { id: 5, time: '11:00 – 12:00', crowd: 30, status: 'available', booked: false },
  { id: 6, time: '14:00 – 15:00', crowd: 25, status: 'available', booked: false },
  { id: 7, time: '17:00 – 18:00', crowd: 88, status: 'busy', booked: false },
  { id: 8, time: '20:00 – 21:00', crowd: 40, status: 'available', booked: false },
];

export const adminStats = {
  totalMembers: 1248,
  activeToday: 134,
  revenue: 84200,
  retention: 82,
  monthlyGrowth: [
    { month: 'Aug', members: 980, revenue: 68000 }, { month: 'Sep', members: 1020, revenue: 71000 },
    { month: 'Oct', members: 1080, revenue: 75000 }, { month: 'Nov', members: 1120, revenue: 78000 },
    { month: 'Dec', members: 1180, revenue: 81000 }, { month: 'Jan', members: 1248, revenue: 84200 },
  ],
  recentMembers: [
    { id: 1, name: 'Arjun Mehta', plan: 'Premium', joined: '2024-01-28', status: 'active' },
    { id: 2, name: 'Priya Sharma', plan: 'Basic', joined: '2024-01-27', status: 'active' },
    { id: 3, name: 'Rohan Verma', plan: 'Premium', joined: '2024-01-25', status: 'active' },
    { id: 4, name: 'Ananya Singh', plan: 'Student', joined: '2024-01-24', status: 'inactive' },
    { id: 5, name: 'Vikram Nair', plan: 'Annual', joined: '2024-01-22', status: 'active' },
    { id: 6, name: 'Deepika Rao', plan: 'Basic', joined: '2024-01-20', status: 'active' },
  ],
  equipment: [
    { name: 'Treadmill #1', usage: 92, status: 'operational' },
    { name: 'Squat Rack A', usage: 78, status: 'operational' },
    { name: 'Bench Press B', usage: 85, status: 'maintenance' },
    { name: 'Leg Press 1', usage: 65, status: 'operational' },
    { name: 'Cable Machine', usage: 70, status: 'operational' },
    { name: 'Rowing Machine', usage: 48, status: 'operational' },
  ],
  subscriptions: [
    { plan: 'Basic', price: 999, members: 480 },
    { plan: 'Premium', price: 1999, members: 520 },
    { plan: 'Student', price: 599, members: 148 },
    { plan: 'Annual', price: 9999, members: 100 },
  ],
};

export const notifications = [
  { id: 1, type: 'crowd', title: 'Low crowd detected!', body: 'Machines area is only 20% full right now.', time: '2m ago', read: false },
  { id: 2, type: 'slot', title: 'Slot confirmed', body: 'Your 10:00 AM slot is confirmed for tomorrow.', time: '1h ago', read: false },
  { id: 3, type: 'workout', title: 'Workout reminder', body: 'Push day scheduled in 2 hours. Get ready!', time: '2h ago', read: true },
  { id: 4, type: 'pr', title: 'New PR achieved!', body: 'You hit a new bench press record: 90kg', time: '1d ago', read: true },
  { id: 5, type: 'diet', title: 'Protein goal reached', body: "You've hit your daily protein target. Nice work!", time: '1d ago', read: true },
];

export const userProfile = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@gmail.com',
  plan: 'Premium',
  joinDate: 'Aug 2023',
  goal: 'Muscle Gain',
  height: 178,
  weight: 75,
  targetWeight: 80,
  bodyFat: 16,
  targetBodyFat: 12,
};

export const exercises = [
  'Bench Press','Incline DB Press','Decline Press','Cable Flye','Push-Up',
  'Deadlift','Romanian Deadlift','Barbell Row','Lat Pulldown','Seated Cable Row','Pull-Up',
  'Squat','Leg Press','Hack Squat','Leg Extension','Leg Curl','Calf Raise',
  'Shoulder Press','Lateral Raise','Front Raise','Face Pull',
  'Bicep Curl','Hammer Curl','Preacher Curl',
  'Tricep Pushdown','Skull Crusher','Overhead Extension','Dips',
  'Plank','Ab Wheel','Crunches','Russian Twist',
];

export const foodDatabase = [
  { name: 'Chicken Breast (100g)', cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (100g)', cal: 218, protein: 4.6, carbs: 46, fat: 1.6 },
  { name: 'Eggs (1 large)', cal: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Oatmeal (100g)', cal: 370, protein: 13, carbs: 66, fat: 7 },
  { name: 'Whey Protein (1 scoop)', cal: 120, protein: 25, carbs: 3, fat: 1.5 },
  { name: 'Banana (1 medium)', cal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Greek Yogurt (100g)', cal: 130, protein: 15, carbs: 9, fat: 4 },
  { name: 'Almonds (30g)', cal: 173, protein: 6, carbs: 6, fat: 15 },
  { name: 'Sweet Potato (100g)', cal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Salmon (100g)', cal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Broccoli (100g)', cal: 55, protein: 3.7, carbs: 7, fat: 0.6 },
  { name: 'Whole Wheat Bread (1 slice)', cal: 81, protein: 4, carbs: 15, fat: 1 },
];
