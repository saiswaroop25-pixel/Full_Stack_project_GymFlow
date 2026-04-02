# GymFlow Backend API

Node.js, Express, Prisma, PostgreSQL, and Socket.IO backend for GymFlow.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Server: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Scripts

- `npm run dev`: start the API with nodemon
- `npm start`: start the API with Node
- `npm run lint`: Prisma validation plus syntax check
- `npm test`: run backend tests
- `npm run db:generate`: generate Prisma client
- `npm run db:push`: sync the schema to the database
- `npm run db:migrate`: create and apply a Prisma migration
- `npm run db:studio`: open Prisma Studio
- `npm run db:seed`: seed demo data

## Environment Variables

See [`gymflow-backend/.env.example`](/c:/Users/manoj/Downloads/Full_Stack_project_GymFlow/gymflow-backend/.env.example).

Required values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`
- `CLIENT_URL`

## Demo Credentials

After seeding:

- Admin: `admin@gymflow.com` / `admin123`
- User: `arjun@example.com` / `user123`

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`

Workouts:

- `GET /api/workouts`
- `GET /api/workouts/:id`
- `POST /api/workouts`
- `PATCH /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `GET /api/workouts/analytics/summary`

Diet:

- `GET /api/diet/meals`
- `GET /api/diet/meals/:id`
- `POST /api/diet/meals`
- `PATCH /api/diet/meals/:id`
- `DELETE /api/diet/meals/:id`
- `GET /api/diet/summary`
- `GET /api/diet/goals`

Crowd:

- `GET /api/crowd/current`
- `GET /api/crowd/hourly`
- `GET /api/crowd/weekly`
- `POST /api/crowd/checkin`
- `POST /api/crowd/checkout`
- `POST /api/crowd/override`
- `POST /api/crowd/broadcast`

Activity:

- `GET /api/activity/attendance`
- `GET /api/activity/stats`

Slots:

- `GET /api/slots`
- `GET /api/slots/mine`
- `POST /api/slots/book`
- `DELETE /api/slots/:id`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/members`
- `GET /api/admin/members/:id`
- `PATCH /api/admin/members/:id`
- `DELETE /api/admin/members/:id`
- `GET /api/admin/equipment`
- `PATCH /api/admin/equipment/:id`
- `GET /api/admin/analytics`
- `GET /api/admin/announcements`
- `POST /api/admin/announcements`
- `DELETE /api/admin/announcements/:id`
- `GET /api/admin/ai-insights`
