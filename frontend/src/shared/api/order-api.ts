import api from '@/shared/api/axios-instance';

export interface OrderItemResponse {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
  excluded_ingredients: number[] | null;
  notes: string | null;
}

export interface OrderStatusHistoryResponse {
  id: number;
  order_id: number;
  from_status: string | null;
  to_status: string;
  changed_by: number;
  reason: string | null;
  created_at: string;
}

export interface OrderResponse {
  id: number;
  user_id: number;
  status: string;
  delivery_address_id: number;
  address_snapshot: any;
  subtotal: string;
  delivery_cost: string;
  total: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemResponse[];
  status_history: OrderStatusHistoryResponse[];
}

export async function listOrders(): Promise<OrderResponse[]> {
  const response = await api.get<OrderResponse[]>('/orders/');
  return response.data;
}

export async function getOrder(id: number): Promise<OrderResponse> {
  const response = await api.get<OrderResponse>(`/orders/${id}`);
  return response.data;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};
