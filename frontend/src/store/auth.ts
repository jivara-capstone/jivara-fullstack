import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types/auth';
import { TEMP_ADMIN_TEST_MODE, TEMP_ADMIN_USER } from '@/lib/tempAdminTestMode';

export type { User, AuthState };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: TEMP_ADMIN_TEST_MODE ? TEMP_ADMIN_USER : null,
      token: null,
      refreshToken: null,
      isAuthenticated: TEMP_ADMIN_TEST_MODE,
      hasHydrated: false,
      setAuth: (user, token, refreshToken) => 
        set({ user, token, refreshToken, isAuthenticated: true }),
      updateUser: (user) =>
        set((state) => ({ user: state.user ? { ...state.user, ...user } : state.user })),
      setHasHydrated: (hasHydrated) => set(() => ({
        hasHydrated,
        ...(TEMP_ADMIN_TEST_MODE && hasHydrated
          ? { user: TEMP_ADMIN_USER, isAuthenticated: true }
          : {}),
      })),
      updateToken: (token) => 
        set({ token }),
      logout: () => 
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'jivara-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
