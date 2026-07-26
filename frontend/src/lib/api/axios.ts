import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Always use the relative path — Next.js rewrites /api/v1/* → BACKEND_URL server-side.
// This keeps all requests same-origin (Vercel domain) so cookies work in production.
const BASE_URL = '/api/v1';


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
        // 10-second timeout prevents Render cold-start hangs from being
        // mistaken for an invalid session and incorrectly logging the user out.
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true, timeout: 10_000 }
        );
        const newAccessToken = res.data?.data?.accessToken;
        if (!newAccessToken) throw new Error('No access token in refresh response');

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: unknown) {
        // Only clear auth state on a definitive auth rejection (401/403).
        // Transient errors (network timeout, 5xx from Render cold start) should
        // NOT log the user out — their session may still be perfectly valid.
        const status = (refreshError as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
