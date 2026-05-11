import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/shared/api/order-api';
import type { OrderResponse } from '@/shared/api/order-api';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrder(Number(id))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  if (!order) {
    return (
      <div className="p-6 text-center text-gray-500">
        Order not found.
        <Link to="/orders" className="block mt-2 text-blue-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const address = order.address_snapshot;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/orders" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to orders
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">Subtotal</span>
            <span className="font-semibold">${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Delivery</span>
            <span className="font-semibold">${Number(order.delivery_cost).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Total</span>
            <span className="font-semibold text-lg">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 text-sm">
            <span className="text-gray-500 block">Notes</span>
            <p className="mt-1">{order.notes}</p>
          </div>
        )}
      </div>

      {address && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Delivery Address</h2>
          <p className="text-sm">
            {address.street} {address.street_number}
            {address.additional_info && <span> - {address.additional_info}</span>}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} {address.zip_code}
          </p>
          <p className="text-sm text-gray-500">{address.country}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    ${Number(item.product_price).toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">${Number(item.subtotal).toFixed(2)}</span>
              </div>
              {item.excluded_ingredients && item.excluded_ingredients.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Excluded ingredients ID: {item.excluded_ingredients.join(', ')}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-gray-400 mt-1">Notes: {item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Status History</h2>
        <div className="relative">
          {order.status_history.length === 0 ? (
            <p className="text-sm text-gray-500">No status changes recorded.</p>
          ) : (
            <div className="space-y-0">
              {order.status_history.map((entry, idx) => (
                <div key={entry.id} className="flex gap-4 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${
                      idx === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    {idx < order.status_history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 -mt-0" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ORDER_STATUS_COLORS[entry.to_status] || 'bg-gray-100'}`}>
                        {ORDER_STATUS_LABELS[entry.to_status] || entry.to_status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-500 mt-1">{entry.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
