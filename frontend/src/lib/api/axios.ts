import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required for refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Auth routes that must NEVER trigger a token-refresh retry.
// Retrying them causes infinite loops (refresh-token failing → retry refresh-token).
const AUTH_ROUTES = ['/auth/refresh-token', '/auth/login', '/auth/logout', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url ?? '';

    // Skip retry for auth endpoints and already-retried requests
    const isAuthRoute = AUTH_ROUTES.some((route) => requestUrl.includes(route));
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = res.data?.data?.accessToken;
        if (!newAccessToken) throw new Error('No access token in refresh response');

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear auth state but do NOT redirect here.
        // Let individual pages / the auth layout handle the redirect gracefully
        // so we avoid the jarring full-page reload caused by window.location.href.
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
