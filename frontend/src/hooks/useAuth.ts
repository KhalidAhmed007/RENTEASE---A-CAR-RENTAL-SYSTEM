
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi, LoginPayload, RegisterPayload } from '@/lib/api/authApi';

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const loginStore = useAuthStore((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = async (data: LoginPayload) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await authApi.login(data);
      const { user, accessToken } = res.data.data;
      loginStore(user, accessToken);
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl ?? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard'));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, setError };
}

// ─── useRegister ─────────────────────────────────────────────────────────────

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.register(data);
      // Removed automatic login; redirect user to login page instead
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, setError };
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { forgotPassword, isLoading, error, success, setError };
}

// ─── useResetPassword ─────────────────────────────────────────────────────────

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error, success, setError };
}
