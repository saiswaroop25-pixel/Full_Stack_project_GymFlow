import api from './client';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getMembers: (params) => api.get('/admin/members', { params }),
  getMember: (id) => api.get(`/admin/members/${id}`),
  getMemberTimeline: (id) => api.get(`/admin/members/${id}/timeline`),
  addMemberNote: (id, data) => api.post(`/admin/members/${id}/notes`, data),
  updateMember: (id, data) => api.patch(`/admin/members/${id}`, data),
  getEquipment: (params) => api.get('/admin/equipment', { params }),
  updateEquipment: (id, data) => api.patch(`/admin/equipment/${id}`, data),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getPayments: () => api.get('/admin/payments'),
  scanCheckInPass: (data) => api.post('/admin/checkin/scan', data),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getAIInsights: () => api.get('/admin/ai-insights'),
};
