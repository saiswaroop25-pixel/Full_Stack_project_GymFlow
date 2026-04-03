import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  handleUnauthorizedSession,
  readStoredToken,
  shouldHandleUnauthorized,
} from './session';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    if (shouldHandleUnauthorized({ status, requestUrl, pathname })) {
      handleUnauthorizedSession();
    }

    return Promise.reject(error);
  }
);

export default api;
