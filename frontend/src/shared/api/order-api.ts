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

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  excluded_ingredients?: number[];
  notes?: string | null;
}

export interface OrderCreate {
  delivery_address_id: number;
  items: OrderItemInput[];
  notes?: string | null;
}

export async function createOrder(data: OrderCreate): Promise<OrderResponse> {
  const response = await api.post<OrderResponse>('/orders/', data);
  return response.data;
}

export async function updateOrderStatus(id: number, status: string, reason?: string | null): Promise<OrderResponse> {
  const response = await api.put<OrderResponse>(`/orders/${id}/status`, { status, reason });
  return response.data;
}



export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En Preparación',
  READY: 'Listo para Retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
  PREPARING: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
  READY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  DELIVERED: 'bg-surface-custom-800 text-surface-custom-400 border-surface-custom-700',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
};
