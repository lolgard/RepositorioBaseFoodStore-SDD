import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, ChevronRight, DollarSign, Package } from 'lucide-react';
import { listOrders, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/shared/api/order-api';
import type { OrderResponse } from '@/shared/api/order-api';
import { useAuthStore } from '@/shared/store/auth-store';


export default function OrderListPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isStoreStaff = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.role === 'GESTOR';


  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-custom-950 p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-primary-400" size={32} />
            {isStoreStaff ? 'Pedidos de la Tienda' : 'Mis Pedidos'}
          </h1>
          <p className="text-surface-custom-400 mt-1">
            {isStoreStaff 
              ? 'Panel de control, seguimiento y administración de pedidos en tiempo real.' 
              : 'Seguimiento y registro de tus compras.'}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card-premium p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-surface-custom-800 rounded-full text-surface-custom-500 mb-4">
            <Package size={48} className="opacity-20" />
          </div>
          <p className="text-surface-custom-400 max-w-xs mx-auto">
            {isStoreStaff
              ? 'No hay ningún pedido registrado en la tienda actualmente.'
              : 'Todavía no realizaste ningún pedido. ¡Visitá nuestro catálogo y empezá a disfrutar!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="card-premium p-5 cursor-pointer group hover:border-primary-500/30 transition-all border border-white/5 flex items-center gap-6"
            >
              <div className="hidden sm:flex p-3 bg-surface-custom-800 rounded-2xl text-surface-custom-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-all">
                <ShoppingBag size={24} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">Pedido #{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ORDER_STATUS_COLORS[order.status] || 'border-surface-custom-700'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-custom-500 font-mono text-xs">
                    <Calendar size={14} />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-surface-custom-400 flex items-center gap-1">
                    <span className="font-bold text-surface-custom-300">{order.items.length}</span> productos en total
                  </p>
                  <p className="text-white font-black text-lg flex items-center gap-0.5">
                    <DollarSign size={16} className="text-primary-400" />
                    {order.total}
                  </p>
                </div>
              </div>

              <div className="p-2 text-surface-custom-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                <ChevronRight size={24} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
