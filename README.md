# 🏋️ GymFlow — Smart Gym Management Platform

A full-stack intelligent fitness management platform with real-time crowd monitoring, workout tracking, diet analytics, and AI-powered insights.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Install & Run
```bash
cd gymflow
npm install
npm start
```
The app will open at `http://localhost:3000`

## 🗺️ App Navigation

### Public Pages (No Auth Required)
| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/login` | Login |
| `/register` | Registration |

### User Module
| Route | Page |
|-------|------|
| `/app/dashboard` | User Dashboard |
| `/app/crowd` | Live Crowd Monitor |
| `/app/calendar` | Google Calendar Sync |
| `/app/workout` | Workout Logger |
| `/app/analytics` | Workout Analytics |
| `/app/diet` | Diet Tracker |
| `/app/activity` | Activity Monitor |
| `/app/goals` | Goal Management |
| `/app/slots` | Slot Booking |
| `/app/notifications` | Notifications |
| `/app/profile` | Profile Settings |

### Admin Module
| Route | Page |
|-------|------|
| `/admin/dashboard` | Admin Operations Hub |
| `/admin/occupancy` | Live Occupancy Control |
| `/admin/members` | Member Management |
| `/admin/equipment` | Equipment Status |
| `/admin/subscriptions` | Subscription & Revenue |
| `/admin/announcements` | Push Notifications |
| `/admin/reports` | Analytics & Reports |
| `/admin/ai-insights` | AI Intelligence Hub |

## 🎨 Design System

- **Font Display**: Bebas Neue (headings)
- **Font Body**: Space Grotesk
- **Font Mono**: JetBrains Mono (numbers, code)
- **Theme**: Dark industrial, lime-green accents
- **Accent Colors**: Lime `#c8ff00`, Red `#ff3b3b`, Amber `#ffb800`, Cyan `#00d4ff`

## 🏗️ Architecture

```
src/
├── components/        # Shared layout components
│   ├── Sidebar.js     # User sidebar navigation
│   ├── AdminLayout.js # Admin layout wrapper
│   └── UserLayout.js  # User layout wrapper
├── context/
│   └── AppContext.js  # Global app state
├── data/
│   └── mockData.js    # All mock data
├── pages/
│   ├── public/        # Landing, Login, Register
│   ├── user/          # 12 user module screens
│   └── admin/         # 8 admin module screens
└── index.css          # Global design system
```

## 🔌 Backend Integration Guide

When building the backend (Node.js + Express + PostgreSQL), connect these endpoints:

### Key API Endpoints to Build
```
GET  /api/gym/crowd              — Live crowd data
POST /api/auth/login             — User login (JWT)
POST /api/auth/register          — User registration
GET  /api/workout/logs           — Workout history
POST /api/workout/logs           — Log new workout
GET  /api/diet/meals             — Today's meals
POST /api/diet/meals             — Add meal
GET  /api/slots/available        — Available booking slots
POST /api/slots/book             — Book a slot
GET  /api/admin/stats            — Admin KPIs
GET  /api/admin/members          — Member list
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Charts | Recharts |
| Styling | Custom CSS Design System |
| State | React Context API |
| Icons | Lucide React |
| Fonts | Google Fonts (Bebas Neue, Space Grotesk, JetBrains Mono) |

## 🎯 Total Screens: 22

3 Public + 11 User Module + 8 Admin Module = **22 screens**

