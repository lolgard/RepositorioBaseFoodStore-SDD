import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/shared/api/order-api';
import type { OrderResponse } from '@/shared/api/order-api';

export default function OrderListPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">Order #{order.id}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{order.items.length} item(s)</span>
                <span className="font-semibold">${order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
