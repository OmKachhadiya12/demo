import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token if user is signed in
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('lustre-user');
      if (stored) {
        const user = JSON.parse(stored);
        const token = user?.token || localStorage.getItem('lustre_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // Ignore json parse error
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message.join(', ')
        : error.message || 'An unexpected error occurred.');
    error.userMessage = message;
    return Promise.reject(error);
  },
);

export default api;
