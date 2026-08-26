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

// Helper to format clean, human-readable error messages
export function getFriendlyErrorMessage(err, fallback = 'An unexpected error occurred. Please try again.') {
  if (!err) return fallback;
  const status = err.response?.status;
  const detail = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message;

  if (detail && typeof detail === 'string') {
    if (detail.includes('buffering timed out') || detail.includes('MongooseError') || detail.includes('ECONNREFUSED')) {
      return 'Database connection timed out. Please check backend MongoDB configuration.';
    }
    return detail;
  }

  if (status === 401) return 'Invalid email or password. Please check your credentials.';
  if (status === 404) return 'Requested account or resource not found.';
  if (status === 409) return 'An account with this email address already exists.';
  if (status === 503) return 'Database service temporarily unavailable. Please try again shortly.';
  if (status >= 500) return 'Server encountered an error. Please try again in a moment.';
  if (err.message === 'Network Error' || !err.response) {
    return 'Unable to connect to server. Please check your network connection.';
  }

  return err.message || fallback;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};

    // Suppress global toast for auth forms (handled by Login/Register UI) and initial session check
    const isAuthForm =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/google');
    const isInitialAuthCheck = error.response?.status === 401 && config.url?.includes('/auth/me');

    if (!config.skipToast && !config.silent && !isAuthForm && !isInitialAuthCheck) {
      const status = error.response?.status;
      const message = getFriendlyErrorMessage(error);

      let title = 'Request Failed';
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

    return Promise.reject(error);
  }
);

export default api;