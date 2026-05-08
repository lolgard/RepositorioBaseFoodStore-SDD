import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const MAX_VISIBLE_TOASTS = 5;
const DISMISS_MS = 5000;
const DEDUP_WINDOW_MS = 2000;

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const { toasts } = get();

    // Deduplicate: if the same message was added within the last 2s, skip
    const recentDuplicate = toasts.find(
      (t) => t.message === message && Date.now() - parseInt(t.id.split('-')[1] || '0', 10) < DEDUP_WINDOW_MS,
    );
    if (recentDuplicate) return;

    const id = `toast-${Date.now()}-${++toastCounter}`;
    const newToast: Toast = { id, message, type };

    const updated = [...toasts, newToast];
    // Enforce max visible toasts
    if (updated.length > MAX_VISIBLE_TOASTS) {
      updated.splice(0, updated.length - MAX_VISIBLE_TOASTS);
    }

    set({ toasts: updated });

    // Auto-dismiss after DISMISS_MS
    setTimeout(() => {
      get().removeToast(id);
    }, DISMISS_MS);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
}));
