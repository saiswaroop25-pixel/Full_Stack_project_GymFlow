import api from './client';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getMembers: (params) => api.get('/admin/members', { params }),
  getMember: (id) => api.get(`/admin/members/${id}`),
  updateMember: (id, data) => api.patch(`/admin/members/${id}`, data),
  getEquipment: (params) => api.get('/admin/equipment', { params }),
  updateEquipment: (id, data) => api.patch(`/admin/equipment/${id}`, data),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getAIInsights: () => api.get('/admin/ai-insights'),
};
