import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

let pendingRequestsCount = 0;
let wakeupTimer = null;

const startWakeupTimer = () => {
  if (wakeupTimer) return;
  wakeupTimer = setTimeout(() => {
    if (pendingRequestsCount > 0) {
      window.dispatchEvent(
        new CustomEvent('app:server-waking', {
          detail: {
            message: 'Waking up the server (free tier spin-up, please wait)...',
          },
        })
      );
    }
  }, 5000);
};

const clearWakeupTimer = () => {
  if (pendingRequestsCount <= 0 && wakeupTimer) {
    clearTimeout(wakeupTimer);
    wakeupTimer = null;
  }
};

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    pendingRequestsCount++;
    startWakeupTimer();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    clearWakeupTimer();
    return Promise.reject(error);
  }
);

// Response interceptor: on 401 Unauthorized, automatically log out user
api.interceptors.response.use(
  (response) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    clearWakeupTimer();
    return response;
  },
  (error) => {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
    clearWakeupTimer();
    if (error.response && error.response.status === 401) {
      // Avoid redirect loop if 401 occurred on /auth/login
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Notify application components via custom event
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
