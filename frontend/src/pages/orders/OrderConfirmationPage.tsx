import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, type OrderResponse, ORDER_STATUS_LABELS } from '@/shared/api/order-api';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Home, ArrowRight } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-surface-custom-400 text-sm font-medium">Buscando los detalles de tu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-6">
        <div className="card-premium p-8 border border-red-500/20 bg-red-500/5">
          <span className="text-4xl">⚠️</span>
          <h1 className="text-2xl font-bold text-red-400 tracking-tight mt-4">Pedido no encontrado</h1>
          <p className="text-surface-custom-400 mt-2">
            No pudimos recuperar la información del pedido #{id}. Verificá el enlace o intentá de nuevo.
          </p>
          <Link 
            to="/" 
            className="btn-premium inline-flex items-center gap-2 mt-6 bg-white/10 text-white"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180 }}
        className="card-premium p-8 text-center space-y-8 border border-white/5 bg-surface-custom-900/40 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Animated Checkmark */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative inline-flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <CheckCircle2 size={80} className="text-emerald-400 relative z-10 filter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
        </motion.div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">¡Pedido Recibido!</h1>
          <p className="text-surface-custom-400 text-sm max-w-md mx-auto">
            Tu pedido <span className="text-primary-400 font-black font-mono">#{order.id}</span> ha sido generado con éxito en el sistema y ya está en marcha.
          </p>
        </div>

        {/* Dynamic Details Box */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 max-w-md mx-auto text-left space-y-3 shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-surface-custom-500 font-bold uppercase tracking-widest text-[9px]">Estado Inicial</span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-surface-custom-500 font-bold uppercase tracking-widest text-[9px]">Método de Pago</span>
            <span className="text-surface-custom-300 font-bold text-xs uppercase tracking-wide">
              💵 Efectivo al recibir
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-surface-custom-500 font-bold uppercase tracking-widest text-[9px]">Productos</span>
            <span className="text-white font-mono font-bold text-xs">
              {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} unidades
            </span>
          </div>

          <div className="h-px bg-white/5 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-white font-black uppercase tracking-widest text-xs">Total Abonado</span>
            <span className="text-primary-400 text-2xl font-black italic tracking-tighter">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Redirect buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/orders/${order.id}`}
            className="w-full sm:w-auto btn-premium gradient-primary text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary-500/25"
          >
            <span>Ver Detalles del Pedido</span>
            <ArrowRight size={18} />
          </Link>
          
          <Link
            to="/orders"
            className="w-full sm:w-auto btn-premium bg-white/5 hover:bg-white/10 text-white border border-white/5 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <ClipboardList size={18} className="text-surface-custom-400" />
            <span>Mis Pedidos</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto btn-premium bg-transparent text-surface-custom-400 hover:text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Home size={18} />
            <span>Inicio</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
