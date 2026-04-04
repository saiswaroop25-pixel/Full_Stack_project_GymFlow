import api from './client';

export const subscriptionAPI = {
  getPlans: () => api.get('/subscription/plans'),
  getMySubscription: () => api.get('/subscription/me'),
  checkout: (data) => api.post('/subscription/checkout', data),
  cancel: () => api.post('/subscription/cancel'),
  getPayments: () => api.get('/subscription/payments'),
};
