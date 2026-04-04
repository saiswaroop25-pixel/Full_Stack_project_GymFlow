import api from './client';

export const dietAPI = {
  getMeals: (params) => api.get('/diet/meals', { params }),
  createMeal: (data) => api.post('/diet/meals', data),
  updateMeal: (id, data) => api.patch(`/diet/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/diet/meals/${id}`),
  getSummary: (params) => api.get('/diet/summary', { params }),
  getMacroGoals: () => api.get('/diet/goals'),
  searchFoods: (q) => api.get('/diet/food/search', { params: { q } }),
  getSavedMeals: () => api.get('/diet/saved-meals'),
  createSavedMeal: (data) => api.post('/diet/saved-meals', data),
  deleteSavedMeal: (id) => api.delete(`/diet/saved-meals/${id}`),
  getMealPlan: (week) => api.get('/diet/plan', { params: { week } }),
  saveMealPlan: (data) => api.post('/diet/plan', data),
};
