import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True once zustand/persist has finished rehydrating from localStorage */
  _hasHydrated: boolean;

  // Actions
  login: (user: AuthUser, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,
      _hasHydrated:    false,

      login: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'rentease-auth',
      storage: createJSONStorage(() => localStorage),

      /**
       * Persist user, accessToken, and isAuthenticated across page loads.
       * Persisting the accessToken avoids a mandatory cross-domain
       * refresh-token network call on every page refresh, which was failing
       * on Render cold starts and logging the user out immediately.
       * If the stored token is expired the axios 401 interceptor will still
       * silently refresh it — this is the happy-path optimisation.
       */
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
