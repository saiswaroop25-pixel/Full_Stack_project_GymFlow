import api from './client';

export const activityAPI = {
  getAttendance: (params) => api.get('/activity/attendance', { params }),
  getStats: () => api.get('/activity/stats'),
};
