import api from './axios-instance';
export const cartApi = {
    getCart: () => api.get<any>('/cart/'),
    syncCart: (items: any[]) => api.post<any>('/cart/sync', { items }),
    deleteCart: () => api.delete('/cart/'),
};
