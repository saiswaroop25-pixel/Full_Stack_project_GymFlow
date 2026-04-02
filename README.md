# GymFlow

Full-stack gym management app with a React frontend and an Express + Prisma backend.

## Project Structure

- `src/`: React frontend
- `gymflow-backend/`: API server, Prisma schema, seed data
- `.env.example`: example env file for local development

## Local Setup

### 1. Install dependencies

```bash
npm install
cd gymflow-backend
npm install
```

### 2. Create env files

Frontend and shared local defaults:

```bash
cp .env.example .env
```

Backend-only example:

```bash
cd gymflow-backend
cp .env.example .env
```

### 3. Set up the database

```bash
cd gymflow-backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run the app

From the repo root:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Useful Scripts

Repo root:

- `npm start`: start the frontend
- `npm run build`: production frontend build
- `npm run lint`: build-based frontend validation
- `npm test`: frontend tests in non-watch mode
- `npm run dev`: run frontend and backend together

Backend (`gymflow-backend/`):

- `npm run dev`: start API with nodemon
- `npm start`: start API
- `npm run lint`: Prisma validation + Node syntax check
- `npm test`: run backend tests
- `npm run db:generate`: generate Prisma client
- `npm run db:push`: sync schema to database
- `npm run db:seed`: seed demo data

## Main App Routes

Public:

- `/`
- `/login`
- `/register`

User:

- `/app/dashboard`
- `/app/crowd`
- `/app/calendar`
- `/app/workout`
- `/app/analytics`
- `/app/diet`
- `/app/activity`
- `/app/goals`
- `/app/slots`
- `/app/notifications`
- `/app/profile`

Admin:

- `/admin/dashboard`
- `/admin/occupancy`
- `/admin/members`
- `/admin/equipment`
- `/admin/subscriptions`
- `/admin/announcements`
- `/admin/reports`
- `/admin/ai-insights`

## Demo Credentials

After running the backend seed:

- Admin: `admin@gymflow.com` / `admin123`
- User: `arjun@example.com` / `user123`
