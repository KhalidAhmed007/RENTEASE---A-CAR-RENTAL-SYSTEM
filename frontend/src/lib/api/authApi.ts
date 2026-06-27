import { api } from './axios';

// ─── Payload types ──────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/login', data),

  register: (data: RegisterPayload) =>
    api.post<{ data: { email: string } }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: () =>
    api.post<{ data: { accessToken: string } }>('/auth/refresh-token'),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post('/auth/reset-password', data),
};

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  email: string;
  role: string;
}
