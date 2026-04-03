import api from './client';

export const crowdAPI = {
  getCurrent: () => api.get('/crowd/current'),
  getHourly: () => api.get('/crowd/hourly'),
  getWeekly: () => api.get('/crowd/weekly'),
  checkIn: () => api.post('/crowd/checkin'),
  checkOut: () => api.post('/crowd/checkout'),
  overrideCrowd: (data) => api.post('/crowd/override', data),
  broadcastAlert: (data) => api.post('/crowd/broadcast', data),
};
