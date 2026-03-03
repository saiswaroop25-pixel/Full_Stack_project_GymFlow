# GymFlow Backend API

> Node.js · Express · PostgreSQL · Prisma · Socket.IO

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Set up the database
npx prisma generate        # generates Prisma client
npx prisma db push         # creates all tables
npm run db:seed            # seeds demo data

# 4. Start development server
npm run dev
```

Server runs at **http://localhost:5000**

---

## Environment Variables (.env)

| Variable              | Description                        | Example                              |
|-----------------------|------------------------------------|--------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string       | `postgresql://user:pass@host/gymflow_db` |
| `JWT_SECRET`          | Secret key for signing JWT tokens  | `your_random_secret_string`          |
| `JWT_EXPIRES_IN`      | Token expiry duration              | `7d`                                 |
| `PORT`                | Server port                        | `5000`                               |
| `NODE_ENV`            | Environment                        | `development` or `production`        |
| `CLIENT_URL`          | Frontend URL for CORS              | `http://localhost:3000`              |

---

## Demo Credentials (after seeding)

| Role  | Email                 | Password   |
|-------|-----------------------|------------|
| Admin | admin@gymflow.com     | admin123   |
| User  | arjun@example.com     | user123    |

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint          | Auth     | Description             |
|--------|-------------------|----------|-------------------------|
| POST   | `/register`       | None     | Create a new account    |
| POST   | `/login`          | None     | Login, get JWT token    |
| GET    | `/me`             | Bearer   | Get current user profile|
| PATCH  | `/profile`        | Bearer   | Update profile fields   |
| PATCH  | `/password`       | Bearer   | Change password         |

---

### Workouts  `/api/workouts`

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | `/`                         | List workout logs (paginated)    |
| POST   | `/`                         | Log a new workout session        |
| GET    | `/:id`                      | Get single workout log           |
| PATCH  | `/:id`                      | Update workout log               |
| DELETE | `/:id`                      | Delete workout log               |
| GET    | `/analytics/summary`        | PRs, volume, muscle distribution |

**POST /api/workouts body example:**
```json
{
  "name": "Push Day",
  "date": "2024-01-20",
  "duration": 65,
  "calories": 380,
  "exercises": [
    {
      "name": "Bench Press",
      "muscleGroup": "Chest",
      "sets": [
        { "reps": 8, "weight": 80 },
        { "reps": 8, "weight": 85 }
      ]
    }
  ]
}
```

---

### Diet  `/api/diet`

| Method | Endpoint          | Description                      |
|--------|-------------------|----------------------------------|
| GET    | `/meals`          | Get meals for a date (`?date=`)  |
| POST   | `/meals`          | Log a new meal                   |
| PATCH  | `/meals/:id`      | Update meal                      |
| DELETE | `/meals/:id`      | Delete meal                      |
| GET    | `/summary`        | Weekly calorie/macro summary     |
| GET    | `/goals`          | Get calculated macro goals       |

---

### Crowd  `/api/crowd`

| Method | Endpoint        | Auth          | Description                         |
|--------|-----------------|---------------|-------------------------------------|
| GET    | `/current`      | Bearer        | Latest occupancy snapshot           |
| GET    | `/hourly`       | Bearer        | Hourly breakdown for today          |
| GET    | `/weekly`       | Bearer        | 7-day average crowd by day          |
| POST   | `/checkin`      | Bearer        | Log member check-in                 |
| POST   | `/checkout`     | Bearer        | Log member check-out                |
| POST   | `/override`     | Admin Bearer  | Force-set occupancy level           |
| POST   | `/broadcast`    | Admin Bearer  | Push alert to all connected clients |

---

### Slot Booking  `/api/slots`

| Method | Endpoint    | Description                     |
|--------|-------------|---------------------------------|
| GET    | `/`         | Available slots (`?date=`)      |
| GET    | `/mine`     | My upcoming bookings            |
| POST   | `/book`     | Book a slot                     |
| DELETE | `/:id`      | Cancel a booking                |

---

### Activity  `/api/activity`

| Method | Endpoint       | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/attendance`  | Attendance history + streak          |
| GET    | `/stats`       | Today's activity summary             |

---

### Admin  `/api/admin`  *(Admin JWT required)*

| Method | Endpoint                  | Description                            |
|--------|---------------------------|----------------------------------------|
| GET    | `/dashboard`              | KPIs, revenue, recent members          |
| GET    | `/members`                | All members (search, filter, paginate) |
| GET    | `/members/:id`            | Member detail with activity history    |
| PATCH  | `/members/:id`            | Update plan / status / role            |
| DELETE | `/members/:id`            | Deactivate member                      |
| GET    | `/equipment`              | Equipment list + maintenance status    |
| PATCH  | `/equipment/:id`          | Update equipment status                |
| GET    | `/analytics`              | Attendance trends, heatmap, growth     |
| GET    | `/announcements`          | All announcements                      |
| POST   | `/announcements`          | Create + broadcast announcement        |
| DELETE | `/announcements/:id`      | Delete announcement                    |
| GET    | `/ai-insights`            | Churn risk, revenue opportunities      |

---

## WebSocket Events  (Socket.IO)

Connect from frontend:
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');
```

| Event               | Direction         | Payload                                                              |
|---------------------|-------------------|----------------------------------------------------------------------|
| `crowd:update`      | Server → Client   | `{ checkedIn, capacity, crowdPct, crowdLevel, timestamp }`           |
| `crowd:alert`       | Server → Client   | `{ message, type, timestamp }`                                       |
| `announcement`      | Server → Client   | `{ title, message, type, timestamp }`                                |
| `admin:override`    | Client → Server   | `{ crowdPct: number }` *(admin only, use REST override instead)*     |

Crowd updates broadcast every **30 seconds** automatically.

---

## Project Structure

```
gymflow-backend/
├── prisma/
│   ├── schema.prisma       # All 9 DB models + enums
│   └── seed.js             # Demo data seeder
├── src/
│   ├── server.js           # Entry point, Express + Socket.IO setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workoutController.js
│   │   ├── dietController.js
│   │   ├── crowdController.js
│   │   ├── slotController.js
│   │   ├── activityController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   ├── diet.js
│   │   ├── crowd.js
│   │   ├── slots.js
│   │   ├── activity.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js         # JWT protect + adminOnly
│   │   ├── errorHandler.js # Global error handler
│   │   └── validate.js     # express-validator helper
│   └── services/
│       └── crowdSocket.js  # Socket.IO simulation + DB snapshots
├── .env.example
├── package.json
└── README.md
```

---

## Database Setup Options

### Option A — Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb gymflow_db
# Set DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/gymflow_db
```

### Option B — Supabase (free hosted)
1. Go to supabase.com → New Project
2. Copy the **Connection String** (URI format)
3. Paste into `.env` as `DATABASE_URL`

### Option C — Neon (free serverless Postgres)
1. Go to neon.tech → New Project
2. Copy connection string → paste into `.env`

---

## Connecting the React Frontend

In your React app, install axios and socket.io-client:
```bash
npm install axios socket.io-client
```

Create `src/api/index.js`:
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('gymflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Replace mock data calls like:
```js
// Before (mock)
import { crowdData } from '../data/mockData';

// After (real API)
import api from '../api';
const { data } = await api.get('/crowd/current');
```
