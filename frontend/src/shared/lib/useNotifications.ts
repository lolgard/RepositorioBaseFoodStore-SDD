import { useEffect } from 'react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';

export const useNotifications = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Use current host for WS connection in production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications?token=${accessToken}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_STATUS_CHANGED') {
        addToast(data.message, 'info');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [isAuthenticated, accessToken, addToast]);
};
