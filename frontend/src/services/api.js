import axios from 'axios';

// Create Axios instance
const API_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'webcraft_token';
const REFRESH_KEY = 'webcraft_refresh';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the access token to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Automatic access-token refresh on 401 ---------------------------------
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
};

const forceLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/register') ||
  url.includes('/auth/refresh') || url.includes('/auth/logout');

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Normalize FastAPI 422 validation array errors to a clean string
    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
      const formattedErrors = error.response.data.detail.map(d => {
        const fieldName = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : '';
        let message = d.msg;
        if (fieldName === 'password' && d.type === 'string_too_short') {
          message = 'minimal 8 karakter';
        } else if (fieldName === 'email' && d.type === 'value_error') {
          message = 'format email tidak valid';
        }
        return fieldName ? `${fieldName}: ${message}` : message;
      });
      error.response.data.detail = formattedErrors.join(', ');
    }

    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    // A refresh is already in flight — queue this request until it resolves.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Use a bare axios call so this request skips the interceptor.
      const resp = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
      const { access_token, refresh_token } = resp.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(REFRESH_KEY, refresh_token);
      flushQueue(null, access_token);
      original.headers.Authorization = `Bearer ${access_token}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
