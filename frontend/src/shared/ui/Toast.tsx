import type { Toast as ToastData, ToastType } from '@/shared/store/toast-store';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const TYPE_ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const TYPE_STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${TYPE_STYLES[toast.type]}`}
    >
      <span className="flex-shrink-0 text-base leading-none" aria-hidden="true">
        {TYPE_ICONS[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <span className="text-lg leading-none">&times;</span>
      </button>
    </div>
  );
}
