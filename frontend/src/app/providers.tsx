import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}
