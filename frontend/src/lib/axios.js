import axios from 'axios';
import toast from 'react-hot-toast';

const normalizeApiUrl = (url) => {
  if (!url) return url;
  const cleaned = url.replace(/\/+$|\s+/g, '');
  return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
};

export const apiBase = normalizeApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,  // Send HTTP-only cookies
  headers: { 'Content-Type': 'application/json' },
});

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

// ─── Global Response Interceptor ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 1. Network error (server unreachable / offline) ──
    if (!error.response) {
      toast.error('🔌 Network error — check your connection or the server is down.', {
        id: 'network-error',  // dedup: only one toast at a time
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // ── 2. 401 → attempt silent token refresh, then retry ──
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
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 3. 429 Rate limit ──
    if (status === 429) {
      toast.error('⏳ Too many requests — please slow down and try again shortly.', {
        id: 'rate-limit',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // ── 4. 5xx Server errors → global toast with API message ──
    if (status >= 500) {
      const msg = error.response?.data?.message || 'Server error — please try again.';
      toast.error(`🚨 ${msg}`, { id: `server-error-${status}`, duration: 6000 });
      return Promise.reject(error);
    }

    // ── 5. All other 4xx (400, 403, 404…) → let individual pages handle them ──
    return Promise.reject(error);
  }
);

export default api;
