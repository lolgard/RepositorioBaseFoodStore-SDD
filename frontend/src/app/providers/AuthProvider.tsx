import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/shared/store/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, setTokens, logout } = useAuthStore();

  useEffect(() => {
    // Check for stored tokens on mount
    const storedToken = localStorage.getItem('food-store-auth');
    if (storedToken && !isAuthenticated) {
      try {
        const parsed = JSON.parse(storedToken);
        if (parsed.state?.accessToken) {
          setTokens(parsed.state.accessToken, parsed.state.refreshToken || '');
        }
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        logout();
      }
    }
  }, [isAuthenticated, setTokens, logout]);

  return <>{children}</>;
}
