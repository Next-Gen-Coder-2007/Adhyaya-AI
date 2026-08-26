import axios from 'axios';
import { showGlobalToast } from '../context/ToastContext';

// Support VITE_API_URL, VITE_API_BASE_URL, or local fallback
const rawUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const sanitizedBaseURL = rawUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: sanitizedBaseURL,
  withCredentials: true,
});

// Attach Authorization Bearer token header if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adhyaya_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};

    // Allow caller to suppress automatic global toast (e.g. background polling checks)
    if (!config.skipToast && !config.silent) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.response?.data?.message;

      // Don't toast for normal 401 unauthenticated on initial session restore
      const isInitialAuthCheck = status === 401 && config.url?.includes('/auth/me');

      if (!isInitialAuthCheck) {
        let title = 'Request Failed';
        let message = detail || error.message || 'An unexpected error occurred. Please try again.';

        if (status === 404) title = 'Resource Not Found';
        else if (status === 403) title = 'Access Forbidden';
        else if (status === 401) title = 'Authentication Required';
        else if (status === 429) title = 'Rate Limit Reached';
        else if (status >= 500) title = 'Server Error';
        else if (!error.response) title = 'Connection Error';

        showGlobalToast({
          type: 'error',
          title,
          message,
          duration: 5000,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;