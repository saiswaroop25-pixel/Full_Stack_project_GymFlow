# GymFlow

GymFlow is a full-stack gym management and member engagement platform built with React, Node.js, Express, PostgreSQL, Prisma, and Socket.IO. The project provides a dual-role experience for gym members and administrators, combining day-to-day fitness workflows with live operational visibility.

This repository is structured for academic evaluation and local demonstration, with seeded demo accounts, a complete frontend, a REST API backend, and real-time crowd and announcement updates.

## Overview

GymFlow is designed to solve two connected problems:

- For members: make gym usage easier through slot booking, workout logging, diet tracking, activity insights, live notifications, and profile-based goal management.
- For administrators: manage members, monitor occupancy, view analytics, publish announcements, track equipment status, and review AI-style operational insights.

The application uses role-based routing, token-based authentication, seeded demo data, and a PostgreSQL-backed data model to simulate a realistic gym operations system.

## Key Features

### Member Features

- Secure authentication and profile management
- Workout logging and workout analytics
- Diet tracking
- Activity monitoring based on attendance and workouts
- Goal management with progress visualization
- Slot booking with crowd-aware availability
- Live crowd tracking
- Real-time and persisted notifications
- Check-in pass access

### Admin Features

- Admin-only dashboard
- Member management and member detail view
- Live occupancy monitoring and override controls
- Equipment tracking and maintenance visibility
- Subscription and revenue overview
- Announcement broadcasting to connected users
- Analytics and reporting views
- AI insights dashboard driven by backend-generated summaries
- Check-in scanner/admin check-in workflow

### Platform Features

- JWT authentication
- Role-based access control
- PostgreSQL database via Prisma ORM
- Socket.IO-powered real-time updates
- Seeded demo data for quick evaluation
- Frontend and backend scripts for local development

## Tech Stack

### Frontend

- React 18
- React Router
- Axios
- Recharts
- Socket.IO Client
- Lucide React

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT
- bcryptjs
- express-validator
- express-rate-limit

## Architecture

The project follows a client-server architecture:

- `src/` contains the React frontend application.
- `gymflow-backend/` contains the Express API, Prisma schema, seed logic, and real-time services.
- The frontend communicates with the backend over REST for CRUD/data operations.
- Socket.IO is used for live occupancy updates and announcement broadcasting.
- Prisma maps application models to PostgreSQL tables.

## Project Structure

```text
Full_Stack_project/
├── src/                       # React frontend
│   ├── api/                   # API clients
│   ├── components/            # Shared UI components
│   ├── context/               # Global app/auth state
│   └── pages/                 # Public, user, and admin pages
├── gymflow-backend/
│   ├── prisma/                # Prisma schema and seed data
│   └── src/
│       ├── controllers/       # Route handlers
│       ├── middleware/        # Auth, validation, error handling
│       ├── routes/            # API routes
│       └── services/          # Socket.IO crowd simulation
├── .env.example               # Frontend/local runtime env example
└── README.md
```

## Core Modules

### User Module

- Dashboard
- Live Crowd
- Calendar / Slot Booking
- Workout Logger
- Workout Analytics
- Diet Tracker
- Activity Monitor
- Goal Management
- Notifications
- Profile
- Check-In Pass

### Admin Module

- Dashboard
- Occupancy Control
- Member Management
- Member Detail
- Equipment Management
- Check-In Scanner
- Subscription Management
- Announcements
- Analytics Reports
- AI Insights

## Database Model Summary

The application includes the following primary entities:

- `User`
- `WorkoutLog`
- `ExerciseSet`
- `Meal`
- `SlotBooking`
- `AttendanceLog`
- `GymStats`
- `Equipment`
- `Announcement`

These models support both member workflows and admin operational workflows.

## Environment Setup

Two environment files are used during local development:

- Root `.env` for frontend/runtime-aligned values
- `gymflow-backend/.env` for backend/server values

### 1. Create the frontend env file

Copy the root example file into `.env`.

Required values are already documented in [.env.example](./.env.example), including:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_SOCKET_URL`
- `REACT_APP_ENABLE_DEMO_ACCOUNTS`

### 2. Create the backend env file

Copy `gymflow-backend/.env.example` into `gymflow-backend/.env`.

Key backend values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CLIENT_URL`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

## Local Installation

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd gymflow-backend
npm install
cd ..
```

### 3. Configure the database

```bash
cd gymflow-backend
npm run db:generate
npm run db:push
npm run db:seed
cd ..
```

This creates the schema in PostgreSQL and loads demo data for evaluation.

## Running the Project

### Run frontend and backend together

From the repository root:

```bash
npm run dev
```

### Run services separately

Frontend:

```bash
npm start
```

Backend:

```bash
cd gymflow-backend
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/health`
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

## Demo Credentials

After running the backend seed:

### Admin

- Email: `admin@gymflow.com`
- Password: `admin123`

### User

- Email: `arjun@example.com`
- Password: `user123`

## Access Control

GymFlow uses role-based route protection:

- Public routes are available without authentication.
- Member routes are mounted under `/app/*`.
- Admin routes are mounted under `/admin/*`.
- Admin pages can only be accessed by users whose role is `ADMIN`.

After login:

- Members are redirected to `/app/dashboard`
- Admins are redirected to `/admin/dashboard`

## Main Routes

### Public

- `/`
- `/login`
- `/register`

### Member

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
- `/app/pass`

### Admin

- `/admin/dashboard`
- `/admin/occupancy`
- `/admin/members`
- `/admin/members/:id`
- `/admin/equipment`
- `/admin/check-in`
- `/admin/subscriptions`
- `/admin/announcements`
- `/admin/reports`
- `/admin/ai-insights`

## Available Scripts

### Root Scripts

- `npm start` - start the React frontend
- `npm run build` - create a production frontend build
- `npm run dev` - run frontend and backend concurrently
- `npm run lint` - frontend validation via production build
- `npm test` - run frontend tests in non-watch mode

### Backend Scripts

Inside `gymflow-backend/`:

- `npm run dev` - start backend with nodemon
- `npm start` - start backend normally
- `npm run lint` - syntax validation for backend entry/controllers
- `npm test` - run backend tests
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - sync schema to database
- `npm run db:migrate` - create/apply Prisma migrations
- `npm run db:studio` - open Prisma Studio
- `npm run db:seed` - seed demo data

## API Overview

The backend exposes REST endpoints grouped by domain:

- `/api/auth`
- `/api/workouts`
- `/api/diet`
- `/api/slots`
- `/api/activity`
- `/api/crowd`
- `/api/admin`
- `/api/subscription`

The application also exposes a Socket.IO server for:

- `crowd:update`
- `announcement`
- `crowd:alert`

## Real-Time Behavior

GymFlow includes a real-time crowd simulation service on the backend. It:

- emits occupancy updates to connected clients
- persists periodic gym statistics snapshots to the database
- powers live crowd views and admin monitoring pages

Announcement broadcasts from the admin panel are also pushed live to connected users.

## Evaluation Notes

This project is suitable for demonstration in a software engineering, full-stack, or capstone-style evaluation because it includes:

- a clear role-based product split
- CRUD workflows across multiple modules
- real-time communication
- relational data modeling
- backend validation and protected routes
- visual analytics dashboards
- seeded demo users for quick reviewer access

For project evaluation, the recommended flow is:

1. Seed the database
2. Log in as admin and review the operational pages
3. Log in as user and test booking, tracking, and dashboard flows
4. Trigger announcements and observe live notification behavior

## Future Improvement Areas

- stronger automated test coverage across frontend and backend flows
- production-grade deployment configuration
- richer audit logging and notification persistence
- external calendar and wearable integrations
- payment gateway integration for subscription workflows

## Authoring Note

This README reflects the current repository structure, current routes, seeded credentials, and local development workflow present in this project.
