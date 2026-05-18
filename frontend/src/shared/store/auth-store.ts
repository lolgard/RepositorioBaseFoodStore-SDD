import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { UserResponse, UserCreate, UserLogin } from '@/entities/user/types';
import { loginUser, registerUser, logoutUser } from '@/shared/api/auth-api';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: UserLogin) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserResponse) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Persist config — only persist auth data, not transient UI state
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
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(data);
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          let message = err.response?.data?.detail || err.response?.data?.title || 'Login failed';
          if (message === 'Invalid email or password') {
            message = 'El email o la contraseña son incorrectos. Por favor, verificá tus datos.';
          } else if (message === 'Account is disabled') {
            message = 'Esta cuenta se encuentra desactivada. Contactá al administrador.';
          } else if (message === 'Login failed') {
            message = 'Ocurrió un error al intentar iniciar sesión. Por favor, intentalo de nuevo.';
          }
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(data);
          set({
            user: response.user,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          let message = err.response?.data?.detail || err.response?.data?.title || 'Registration failed';
          if (message === 'Email is already registered') {
            message = 'El email ingresado ya se encuentra registrado. Probá con otro o iniciá sesión.';
          } else if (message === 'Registration failed') {
            message = 'Ocurrió un error al intentar registrar la cuenta. Por favor, intentalo de nuevo.';
          }
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        }),

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await logoutUser(refreshToken);
          }
        } catch {
          // Ignore logout API errors — clear state regardless
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    persistOptions
  )
);
