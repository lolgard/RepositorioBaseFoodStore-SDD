import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, type OrderResponse } from '@/shared/api/order-api';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrder(Number(id))
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading order...</div>;
  if (error || !order) return <div className="p-6 text-center text-red-500">Order not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Order Created!</h1>
        <p className="text-gray-600 mb-6">
          Your order <strong>#{order.id}</strong> has been placed successfully.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Status</span>
            <span className="font-medium">{order.status}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-lg">${order.total}</span>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            to={`/orders/${order.id}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Order Details
          </Link>
          <Link
            to="/orders"
            className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
