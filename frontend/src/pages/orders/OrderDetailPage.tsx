import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, updateOrderStatus } from '@/shared/api/order-api';
import type { OrderResponse } from '@/shared/api/order-api';
import { ChevronLeft, MapPin, Package, Clock, DollarSign, Calendar, Info, Settings } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';


export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore((s) => s.user);
  const isStoreStaff = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.role === 'GESTOR';
  const addToast = useToastStore((s) => s.addToast);

  const [updating, setUpdating] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (!order) return;
    try {
      setUpdating(true);
      const updatedOrder = await updateOrderStatus(order.id, nextStatus, changeReason || null);
      setOrder(updatedOrder);
      setChangeReason('');
      addToast(`Pedido actualizado a ${ORDER_STATUS_LABELS[nextStatus] || nextStatus}`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al cambiar el estado del pedido.';
      addToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  };


  useEffect(() => {
    if (!id) return;
    getOrder(Number(id))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!order) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-6 card-premium inline-block">
          <Info className="text-red-400 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-white">Pedido no encontrado</h1>
          <p className="text-surface-custom-400 mt-2">No pudimos localizar la información de este pedido.</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-premium mt-6 flex items-center gap-2 mx-auto"
          >
            <ChevronLeft size={20} />
            Volver a {isStoreStaff ? 'pedidos' : 'mis pedidos'}
          </button>
        </div>
      </div>
    );
  }

  const address = order.address_snapshot;

  return (
    <div className="min-h-screen bg-surface-custom-950 p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="group flex items-center gap-1 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">
            {isStoreStaff ? 'Pedidos' : 'Mis Pedidos'}
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${ORDER_STATUS_COLORS[order.status] || 'border-surface-custom-700'}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="card-premium p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Package size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter italic">
                  PEDIDO <span className="text-primary-400">#{order.id}</span>
                </h1>
                <div className="flex items-center gap-4 mt-2 text-surface-custom-400 font-mono text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 block mb-1">Subtotal</span>
                  <span className="text-white font-bold text-xl">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 block mb-1">Envío</span>
                  <span className="text-white font-bold text-xl">${Number(order.delivery_cost).toFixed(2)}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 block mb-1">Total Final</span>
                  <span className="text-primary-400 font-black text-2xl flex items-center gap-1">
                    <DollarSign size={20} />
                    {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 block mb-1">Notas del cliente</span>
                  <p className="text-sm text-surface-custom-300 italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="card-premium overflow-hidden">
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center gap-3">
              <Package size={20} className="text-primary-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest italic">Productos ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 group hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{item.product_name}</p>
                      <p className="text-xs text-surface-custom-400 font-mono">
                        ${Number(item.product_price).toFixed(2)} x <span className="text-white">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="text-white font-black">${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                  {(item.excluded_ingredients || item.notes) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.excluded_ingredients?.map((ingId) => (
                        <span key={ingId} className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold uppercase border border-red-500/20">
                          Sin Ingrediente #{ingId}
                        </span>
                      ))}
                      {item.notes && (
                        <span className="px-2 py-0.5 rounded-lg bg-surface-custom-800 text-surface-custom-400 text-[10px] font-bold italic border border-surface-custom-700">
                          "{item.notes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Status Management Card */}
          {isStoreStaff && (
            <div className="card-premium p-6 space-y-6 border border-primary-500/20 bg-primary-500/[0.02]">
              <div className="flex items-center gap-3 text-primary-400">
                <Settings size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">Gestión de Estado</h2>
              </div>
              
              {['DELIVERED', 'CANCELLED'].includes(order.status) ? (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                  <p className="text-xs text-surface-custom-500 font-bold uppercase">Estado Terminal</p>
                  <p className="text-xs text-surface-custom-400 mt-1">Este pedido ya ha finalizado y no permite más cambios.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-custom-400">
                      Motivo del Cambio (Opcional)
                    </label>
                    <input
                      type="text"
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="Ej: Ingredientes listos, reprogramado..."
                      className="w-full px-4 py-3 bg-surface-custom-950 border border-white/5 rounded-xl text-white outline-none focus:border-primary-500 transition-all text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-custom-400 block">
                      Acción de Transición
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {ALLOWED_TRANSITIONS[order.status]?.map((nextStatus) => {
                        const isCancel = nextStatus === 'CANCELLED';
                        return (
                          <button
                            key={nextStatus}
                            disabled={updating}
                            onClick={() => handleStatusChange(nextStatus)}
                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                              isCancel
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                : 'gradient-primary text-white shadow-lg shadow-primary-500/10 hover:scale-[1.01]'
                            }`}
                          >
                            {updating ? 'Procesando...' : `Pasar a ${ORDER_STATUS_LABELS[nextStatus] || nextStatus}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address Card */}
          {address && (
            <div className="card-premium p-6 space-y-4">
              <div className="flex items-center gap-3 text-primary-400">
                <MapPin size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">Entrega</h2>
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold">
                  {address.street} {address.street_number}
                </p>
                <p className="text-sm text-surface-custom-400">
                  {address.city}, {address.state} {address.zip_code}
                </p>
                {address.additional_info && (
                  <p className="text-xs text-surface-custom-500 italic mt-2 border-l-2 border-primary-500/30 pl-2">
                    {address.additional_info}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status History Card */}
          <div className="card-premium p-6 space-y-6">
            <div className="flex items-center gap-3 text-primary-400">
              <Clock size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Historial</h2>
            </div>
            
            <div className="relative space-y-6 ml-3 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {order.status_history.length === 0 ? (
                <p className="text-xs text-surface-custom-500 italic">No hay cambios registrados.</p>
              ) : (
                [...order.status_history].reverse().map((entry, idx) => (
                  <div key={entry.id} className="relative pl-6">
                    <div className={`absolute left-[-5px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-surface-custom-950 ${
                      idx === 0 ? 'bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-surface-custom-700'
                    }`} />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${ORDER_STATUS_COLORS[entry.to_status] || 'border-surface-custom-700'}`}>
                          {ORDER_STATUS_LABELS[entry.to_status] || entry.to_status}
                        </span>
                        <span className="text-[10px] font-mono text-surface-custom-500">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="text-xs text-surface-custom-400 italic">"{entry.reason}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
