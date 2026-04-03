import api from './client';

export const slotAPI = {
  getSlots: (date) => api.get('/slots', { params: { date } }),
  getMyBookings: () => api.get('/slots/mine'),
  bookSlot: (data) => api.post('/slots/book', data),
  cancelBooking: (id) => api.delete(`/slots/${id}`),
};
