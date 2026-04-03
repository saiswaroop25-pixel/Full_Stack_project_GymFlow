import api from './client';

export const workoutAPI = {
  getLogs: (params) => api.get('/workouts', { params }),
  getLog: (id) => api.get(`/workouts/${id}`),
  createLog: (data) => api.post('/workouts', data),
  updateLog: (id, data) => api.patch(`/workouts/${id}`, data),
  deleteLog: (id) => api.delete(`/workouts/${id}`),
  getAnalytics: (params) => api.get('/workouts/analytics/summary', { params }),
};
