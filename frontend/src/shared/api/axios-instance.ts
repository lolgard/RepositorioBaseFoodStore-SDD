import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/shared/store/auth-store';

// Extend Axios config to include _retry flag
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Get API URL from environment or use default
const getApiUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  return envUrl || '/api/v1';
};

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Attempt to refresh tokens
        const response = await axios.post(
          `${getApiUrl()}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = response.data;

        // Update store with new tokens
        useAuthStore.getState().setTokens(access_token, refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
