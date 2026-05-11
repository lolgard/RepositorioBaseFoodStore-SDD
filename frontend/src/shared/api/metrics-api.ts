import api from '@/shared/api/axios-instance';

export interface MetricsSummary {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export async function getSummary(): Promise<MetricsSummary> {
  const response = await api.get<MetricsSummary>('/admin/metrics/summary');
  return response.data;
}

export async function getSalesEvolution(days: number = 30): Promise<SalesPoint[]> {
  const response = await api.get<SalesPoint[]>('/admin/metrics/sales-evolution', { params: { days } });
  return response.data;
}

export async function getTopProducts(limit: number = 10): Promise<TopProduct[]> {
  const response = await api.get<TopProduct[]>('/admin/metrics/top-products', { params: { limit } });
  return response.data;
}

export async function getOrdersByStatus(): Promise<OrderStatusCount[]> {
  const response = await api.get<OrderStatusCount[]>('/admin/metrics/orders-by-status');
  return response.data;
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});
