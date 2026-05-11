import { useState, useEffect } from 'react';
import {
  getSummary, getSalesEvolution, getTopProducts, getOrdersByStatus,
  type MetricsSummary, type SalesPoint, type TopProduct, type OrderStatusCount,
  CURRENCY_FORMATTER,
} from '@/shared/api/metrics-api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSummary(),
      getSalesEvolution(30),
      getTopProducts(10),
      getOrdersByStatus(),
    ])
      .then(([s, sl, tp, os]) => {
        setSummary(s);
        setSales(sl);
        setTopProducts(tp);
        setOrdersByStatus(os);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1);
  const maxProductQty = Math.max(...topProducts.map((p) => p.total_quantity), 1);
  const maxStatusCount = Math.max(...ordersByStatus.map((o) => o.count), 1);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{summary?.total_users ?? '-'}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{summary?.total_orders ?? '-'}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">
            {summary ? CURRENCY_FORMATTER.format(summary.total_revenue) : '-'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-500">Avg Order Value</div>
          <div className="text-2xl font-bold">
            {summary ? CURRENCY_FORMATTER.format(summary.average_order_value) : '-'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Sales Evolution (30 days)</h2>
        {sales.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sales data yet.</p>
        ) : (
          <div className="space-y-1">
            {sales.map((point) => (
              <div key={point.date} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-24 shrink-0">{point.date}</span>
                <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded transition-all"
                    style={{ width: `${(point.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-20 text-right">
                  {CURRENCY_FORMATTER.format(point.revenue)}
                </span>
                <span className="text-xs text-gray-400 w-8 text-right">({point.orders})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No product sales yet.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, i) => (
                <div key={product.product_name} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 w-6">{i + 1}.</span>
                  <span className="text-sm flex-1 truncate">{product.product_name}</span>
                  <div className="flex-1 bg-gray-100 rounded h-4 relative overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded transition-all"
                      style={{ width: `${(product.total_quantity / maxProductQty) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{product.total_quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          {ordersByStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-24">{item.status}</span>
                  <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded transition-all"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
