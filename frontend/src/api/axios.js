import axios from "axios";
import { showGlobalToast } from "../context/ToastContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
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