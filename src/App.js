import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import LandingPage   from './pages/public/LandingPage';
import LoginPage     from './pages/public/LoginPage';
import RegisterPage  from './pages/public/RegisterPage';

import UserLayout           from './components/UserLayout';
import UserDashboard        from './pages/user/UserDashboard';
import LiveCrowdPage        from './pages/user/LiveCrowdPage';
import CalendarSyncPage     from './pages/user/CalendarSyncPage';
import WorkoutLoggerPage    from './pages/user/WorkoutLoggerPage';
import WorkoutAnalyticsPage from './pages/user/WorkoutAnalyticsPage';
import DietTrackerPage      from './pages/user/DietTrackerPage';
import ActivityMonitorPage  from './pages/user/ActivityMonitorPage';
import GoalManagementPage   from './pages/user/GoalManagementPage';
import SlotBookingPage      from './pages/user/SlotBookingPage';
import NotificationsPage    from './pages/user/NotificationsPage';
import ProfilePage          from './pages/user/ProfilePage';
import CheckInPassPage      from './pages/user/CheckInPassPage';

import AdminLayout            from './components/AdminLayout';
import AdminDashboard         from './pages/admin/AdminDashboard';
import LiveOccupancyControl   from './pages/admin/LiveOccupancyControl';
import ManageMembers          from './pages/admin/ManageMembers';
import EquipmentPage          from './pages/admin/EquipmentPage';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import AnnouncementPage       from './pages/admin/AnnouncementPage';
import AnalyticsReports       from './pages/admin/AnalyticsReports';
import AIInsightsPage         from './pages/admin/AIInsightsPage';
import MemberDetailPage       from './pages/admin/MemberDetailPage';
import CheckInScannerPage     from './pages/admin/CheckInScannerPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/app/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="noise-overlay">
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/app" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index                element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"     element={<UserDashboard />} />
          <Route path="crowd"         element={<LiveCrowdPage />} />
          <Route path="calendar"      element={<CalendarSyncPage />} />
          <Route path="workout"       element={<WorkoutLoggerPage />} />
          <Route path="analytics"     element={<WorkoutAnalyticsPage />} />
          <Route path="diet"          element={<DietTrackerPage />} />
          <Route path="activity"      element={<ActivityMonitorPage />} />
          <Route path="goals"         element={<GoalManagementPage />} />
          <Route path="slots"         element={<SlotBookingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile"       element={<ProfilePage />} />
          <Route path="pass"          element={<CheckInPassPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index                element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="occupancy"     element={<LiveOccupancyControl />} />
          <Route path="members"       element={<ManageMembers />} />
          <Route path="members/:id"   element={<MemberDetailPage />} />
          <Route path="equipment"     element={<EquipmentPage />} />
          <Route path="check-in"      element={<CheckInScannerPage />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="announcements" element={<AnnouncementPage />} />
          <Route path="reports"       element={<AnalyticsReports />} />
          <Route path="ai-insights"   element={<AIInsightsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
