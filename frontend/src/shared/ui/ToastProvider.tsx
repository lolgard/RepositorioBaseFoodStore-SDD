import type { ReactNode } from 'react';
import { ToastContainer } from '@/shared/ui/ToastContainer';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides the toast notification container at the app root.
 * Toast state is managed by the zustand store directly;
 * this provider just renders the UI layer.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
