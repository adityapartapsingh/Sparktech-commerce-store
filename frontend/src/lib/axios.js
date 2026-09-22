import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const normalizeApiUrl = (url) => {
  if (!url) return url;
  const cleaned = url.replace(/\/+$|\s+/g, '');
  return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
};

// In production (Vercel), use relative URL so requests go through the Vercel proxy.
// This makes cookies first-party and fixes mobile browser third-party cookie blocking.
// In local dev, use the direct backend URL from .env.
const isVercelProd = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
export const apiBase = isVercelProd
  ? '/api/v1'
  : normalizeApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Bearer Token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

// Global Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Network error handling (server offline or unreachable)
    if (!error.response) {
      toast.error('Network error — check your connection or the server is down.', {
        id: 'network-error',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // 401 Unauthorized: attempt silent token refresh, then retry
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh token in body (works even when cookies are blocked)
        const { refreshToken } = useAuthStore.getState();
        const res = await api.post('/auth/refresh', { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
        useAuthStore.getState().setTokens({ accessToken: newAccess, refreshToken: newRefresh });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Rate limit handling
    if (status === 429) {
      toast.error('Too many requests — please slow down and try again shortly.', {
        id: 'rate-limit',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Server errors (5xx)
    if (status >= 500) {
      const msg = error.response?.data?.message || 'Server error — please try again.';
      toast.error(msg, { id: `server-error-${status}`, duration: 6000 });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
