import api from './client';

export const activityAPI = {
  getNotifications: () => api.get('/activity/notifications'),
  getAttendance: (params) => api.get('/activity/attendance', { params }),
  getStats: () => api.get('/activity/stats'),
};
