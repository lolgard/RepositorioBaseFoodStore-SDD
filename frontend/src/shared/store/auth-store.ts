import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { UserResponse } from '@/entities/user/types';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserResponse) => void;
  logout: () => void;
  clearAuth: () => void;
}

// Persist config
const persistOptions: PersistOptions<AuthState, Pick<AuthState, 'accessToken' | 'refreshToken' | 'user' | 'isAuthenticated'>> = {
  name: 'food-store-auth',
  partialize: (state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        }),

      setUser: (user) => set({ user }),

      logout: () => {
        // Call logout endpoint (optional)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    persistOptions
  )
);
