import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymflow_token');
      localStorage.removeItem('gymflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)        => api.post('/auth/register', data),
  login:    (data)        => api.post('/auth/login', data),
  getMe:    ()            => api.get('/auth/me'),
  updateProfile: (data)   => api.patch('/auth/profile', data),
  changePassword: (data)  => api.patch('/auth/password', data),
};

// ── Workouts ──────────────────────────────────────────────────────────────────
export const workoutAPI = {
  getLogs:      (params)  => api.get('/workouts', { params }),
  getLog:       (id)      => api.get(`/workouts/${id}`),
  createLog:    (data)    => api.post('/workouts', data),
  updateLog:    (id, data)=> api.patch(`/workouts/${id}`, data),
  deleteLog:    (id)      => api.delete(`/workouts/${id}`),
  getAnalytics: (params)  => api.get('/workouts/analytics/summary', { params }),
};

// ── Diet ──────────────────────────────────────────────────────────────────────
export const dietAPI = {
  getMeals:     (params)  => api.get('/diet/meals', { params }),
  createMeal:   (data)    => api.post('/diet/meals', data),
  updateMeal:   (id, data)=> api.patch(`/diet/meals/${id}`, data),
  deleteMeal:   (id)      => api.delete(`/diet/meals/${id}`),
  getSummary:   (params)  => api.get('/diet/summary', { params }),
  getMacroGoals:()        => api.get('/diet/goals'),
};

// ── Crowd ─────────────────────────────────────────────────────────────────────
export const crowdAPI = {
  getCurrent: ()          => api.get('/crowd/current'),
  getHourly:  ()          => api.get('/crowd/hourly'),
  getWeekly:  ()          => api.get('/crowd/weekly'),
  checkIn:    ()          => api.post('/crowd/checkin'),
  checkOut:   ()          => api.post('/crowd/checkout'),
};

// ── Slots ─────────────────────────────────────────────────────────────────────
export const slotAPI = {
  getSlots:       (date)  => api.get('/slots', { params: { date } }),
  getMyBookings:  ()      => api.get('/slots/mine'),
  bookSlot:       (data)  => api.post('/slots/book', data),
  cancelBooking:  (id)    => api.delete(`/slots/${id}`),
};

// ── Activity ──────────────────────────────────────────────────────────────────
export const activityAPI = {
  getAttendance: (params) => api.get('/activity/attendance', { params }),
  getStats:      ()       => api.get('/activity/stats'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:         ()          => api.get('/admin/dashboard'),
  getMembers:           (params)    => api.get('/admin/members', { params }),
  getMember:            (id)        => api.get(`/admin/members/${id}`),
  updateMember:         (id, data)  => api.patch(`/admin/members/${id}`, data),
  getEquipment:         (params)    => api.get('/admin/equipment', { params }),
  updateEquipment:      (id, data)  => api.patch(`/admin/equipment/${id}`, data),
  getAnalytics:         (params)    => api.get('/admin/analytics', { params }),
  getAnnouncements:     ()          => api.get('/admin/announcements'),
  createAnnouncement:   (data)      => api.post('/admin/announcements', data),
  deleteAnnouncement:   (id)        => api.delete(`/admin/announcements/${id}`),
  getAIInsights:        ()          => api.get('/admin/ai-insights'),
};

export default api;
