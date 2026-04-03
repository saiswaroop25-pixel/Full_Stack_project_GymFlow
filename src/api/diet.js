import api from './client';

export const dietAPI = {
  getMeals: (params) => api.get('/diet/meals', { params }),
  createMeal: (data) => api.post('/diet/meals', data),
  updateMeal: (id, data) => api.patch(`/diet/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/diet/meals/${id}`),
  getSummary: (params) => api.get('/diet/summary', { params }),
  getMacroGoals: () => api.get('/diet/goals'),
};
