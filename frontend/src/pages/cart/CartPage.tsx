import { useState, useEffect } from 'react';
import { useCartStore, getTotalItems, getSubtotal } from '@/shared/store/cart-store';
import { CouponInput } from '@/widgets/cart/CouponInput';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, X, Check, MapPin, LogIn } from 'lucide-react';
import { listAddresses } from '@/shared/api/address-api';
import { createOrder } from '@/shared/api/order-api';
import type { Address } from '@/entities/address/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/shared/store/auth-store';


export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, discountPercentage } = useCartStore();
  const totalItems = getTotalItems(items);
  const subtotal = getSubtotal(items);
  
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isClient = user?.role === 'CLIENTE';


  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'MERCADOPAGO' | 'TARJETA'>('EFECTIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Load addresses when checkout modal opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setLoadingAddresses(true);
      setCheckoutError(null);
      listAddresses()
        .then((data) => {
          setAddresses(data);
          const defaultAddress = data.find((addr) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.length > 0) {
            setSelectedAddressId(data[0].id);
          }
        })
        .catch(() => {
          setCheckoutError('No pudimos cargar tus direcciones. Probá de nuevo.');
        })
        .finally(() => {
          setLoadingAddresses(false);
        });
    }
  }, [isCheckoutOpen]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setCheckoutError('Por favor, seleccioná una dirección para la entrega.');
      return;
    }
    if (paymentMethod !== 'EFECTIVO') {
      setCheckoutError('El método de pago seleccionado no está habilitado actualmente.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    const orderData = {
      delivery_address_id: selectedAddressId,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        excluded_ingredients: item.excluded_ingredients,
        notes: item.notes || null,
      })),
      notes: orderNotes.trim() || null,
    };

    try {
      const createdOrder = await createOrder(orderData);
      clearCart();
      setIsCheckoutOpen(false);
      navigate(`/orders/${createdOrder.id}/confirmed`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' 
        ? detail 
        : 'Error al procesar el pedido. Por favor, verificá el stock o intentá de nuevo.';
      setCheckoutError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-6 py-20">
        <div className="p-6 card-premium inline-block">
          <ShoppingBag className="text-surface-custom-600 mx-auto mb-4 opacity-20" size={80} />
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Tu carrito está vacío</h1>
          <p className="text-surface-custom-400 mt-2 max-w-sm mx-auto">
            ¡Parece que todavía no elegiste nada rico! Dale una mirada a nuestro catálogo.
          </p>
          <Link 
            to="/products" 
            className="btn-premium mt-8 inline-flex items-center gap-2"
          >
            Explorar Catálogo
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const finalTotal = subtotal * (1 - discountPercentage / 100);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShoppingCart className="text-primary-400" size={32} />
            Tu Carrito
          </h1>
          <p className="text-surface-custom-400 mt-1">Tenés <span className="text-primary-400 font-bold">{totalItems}</span> productos listos para pedir.</p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={16} />
          Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const sortedExcluded = [...item.excluded_ingredients].sort();
            return (
              <div
                key={`${item.product_id}-${sortedExcluded.join(',')}`}
                className="card-premium p-5 group hover:border-white/10 transition-all border border-white/5"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight italic uppercase">
                      {item.name}
                    </h3>
                    <p className="text-xs text-surface-custom-500 font-mono">
                      Precio unitario: <span className="text-surface-custom-300">${Number(item.price).toFixed(2)}</span>
                    </p>

                    {item.excluded_ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.excluded_ingredients.map((ingId) => (
                          <span key={ingId} className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-lg border border-red-500/20 font-black uppercase">
                            <X size={10} />
                            Ingrediente #{ingId}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-2 p-2 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-surface-custom-500 italic">"{item.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-1 p-1 bg-surface-custom-900 rounded-2xl border border-white/5">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-white font-black font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-black text-white italic tracking-tighter">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-[10px] font-black uppercase tracking-widest text-surface-custom-500 hover:text-red-400 transition-colors mt-1"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column - summary summary */}
        <div className="space-y-4">
          <div className="card-premium p-6 space-y-6 sticky top-24">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-4">
              Resumen
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-surface-custom-400 uppercase font-black tracking-widest text-[10px]">Subtotal</span>
                <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-custom-400 uppercase font-black tracking-widest text-[10px]">Descuento ({discountPercentage}%)</span>
                  <span className="text-red-400 font-bold">-${(subtotal * discountPercentage / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-surface-custom-400 uppercase font-black tracking-widest text-[10px]">Envío</span>
                <span className="text-emerald-400 font-bold">Gratis</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-white uppercase font-black tracking-widest text-xs">Total</span>
                <span className="text-primary-400 text-3xl font-black tracking-tighter italic">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {isClient ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full btn-premium gradient-primary text-white py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all group"
              >
                <span>Finalizar Compra</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : !isAuthenticated ? (
              <button
                onClick={() => navigate('/login?redirect=/cart')}
                className="w-full btn-premium gradient-primary text-white py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all group"
              >
                <LogIn size={20} />
                <span>Iniciar Sesión para Comprar</span>
              </button>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-center">
                <p className="text-xs font-bold leading-relaxed">
                  ⚠️ Cuenta Administrativa: Como miembro del personal ({user?.role}), no podés realizar pedidos. Iniciá sesión con una cuenta de cliente para comprar.
                </p>
              </div>
            )}
            <p className="text-[10px] text-center text-surface-custom-600 uppercase font-bold tracking-widest">
              Pago seguro y stock garantizado
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal (Microsoft Copilot Inspired Aesthetics) */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) setIsCheckoutOpen(false);
              }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-surface-custom-900 border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col justify-between"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-md">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Finalizar Pedido</h2>
                    <p className="text-xs text-surface-custom-400">Completá los datos para recibir tu comida</p>
                  </div>
                </div>
                
                <button
                  disabled={isSubmitting}
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-surface-custom-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handlePlaceOrder} className="space-y-6 overflow-y-auto flex-grow pr-1 custom-scrollbar">
                {checkoutError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2 select-none"
                  >
                    <span className="text-base">⚠️</span>
                    {checkoutError}
                  </motion.div>
                )}

                {/* Section 1: Address selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-surface-custom-400 flex items-center gap-2">
                    <MapPin size={14} className="text-primary-400" />
                    Dirección de Entrega
                  </label>
                  
                  {loadingAddresses ? (
                    <div className="py-4 text-center text-xs text-surface-custom-500">Cargando tus direcciones...</div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedAddressId || ''}
                        disabled={isSubmitting}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                        className="w-full px-4 py-3.5 bg-surface-custom-950 border border-white/5 rounded-xl text-white outline-none focus:border-primary-500 transition-all font-medium text-sm"
                      >
                        <option value="" disabled>Seleccioná una dirección...</option>
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.street} {addr.street_number}, {addr.city} {addr.additional_info ? `(${addr.additional_info})` : ''} {addr.is_default ? '(Predeterminada)' : ''}
                          </option>
                        ))}
                      </select>
                      <div className="text-right">
                        <Link 
                          to="/addresses/new" 
                          className="text-[10px] font-black tracking-wider text-primary-400 hover:text-primary-300 transition-colors uppercase"
                        >
                          + Crear Otra Dirección
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-center space-y-3">
                      <p className="text-sm text-surface-custom-400">No tenés direcciones registradas para recibir tu pedido.</p>
                      <Link 
                        to="/addresses/new" 
                        className="inline-block bg-white/10 hover:bg-white/20 text-white rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all"
                      >
                        Registrar Dirección
                      </Link>
                    </div>
                  )}
                </div>

                {/* Section 2: Payment Method */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-surface-custom-400">
                    💳 Elegí tu Método de Pago
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Cash (Active) */}
                    <div
                      onClick={() => {
                        if (!isSubmitting) setPaymentMethod('EFECTIVO');
                      }}
                      className={`card-premium p-4 cursor-pointer relative border transition-all ${
                        paymentMethod === 'EFECTIVO'
                          ? 'border-primary-500 bg-primary-500/5'
                          : 'border-white/5 bg-white/[0.01]'
                      }`}
                    >
                      {paymentMethod === 'EFECTIVO' && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full gradient-primary flex items-center justify-center text-white scale-90">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shrink-0 shadow-md">
                          <span className="text-base select-none">💵</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Efectivo</h4>
                          <p className="text-[9px] text-surface-custom-400 mt-0.5 truncate">Al Recibir</p>
                        </div>
                      </div>
                    </div>

                    {/* Mercado Pago (Disabled) */}
                    <div
                      className="card-premium p-4 opacity-30 cursor-not-allowed border border-white/5 bg-white/[0.01] relative select-none"
                      title="Próximamente disponible"
                    >
                      <span className="absolute top-2 right-2 bg-white/10 text-white font-bold text-[7px] px-1 rounded uppercase tracking-wider">
                        En breve
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-custom-950 flex items-center justify-center text-surface-custom-400 shrink-0 border border-white/5">
                          <span className="text-base">💳</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-surface-custom-500 uppercase tracking-tight truncate">Mercado Pago</h4>
                          <p className="text-[9px] text-surface-custom-600 mt-0.5 truncate">Pago Online</p>
                        </div>
                      </div>
                    </div>

                    {/* Credit Card (Disabled) */}
                    <div
                      className="card-premium p-4 opacity-30 cursor-not-allowed border border-white/5 bg-white/[0.01] relative select-none"
                      title="Próximamente disponible"
                    >
                      <span className="absolute top-2 right-2 bg-white/10 text-white font-bold text-[7px] px-1 rounded uppercase tracking-wider">
                        En breve
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-custom-950 flex items-center justify-center text-surface-custom-400 shrink-0 border border-white/5">
                          <span className="text-base">🏦</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-surface-custom-500 uppercase tracking-tight truncate">Tarjetas</h4>
                          <p className="text-[9px] text-surface-custom-600 mt-0.5 truncate">Crédito/Débito</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Notes */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-surface-custom-400">
                    📝 Notas para el Pedido (Opcional)
                  </label>
                  <textarea
                    value={orderNotes}
                    disabled={isSubmitting}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ej: Tocar el timbre B, dejar en consejería, sin aderezos, traer cambio..."
                    className="w-full px-4 py-3 bg-surface-custom-950 border border-white/5 rounded-xl text-white outline-none focus:border-primary-500 transition-all text-sm h-20 resize-none placeholder:text-surface-custom-500"
                  />
                </div>

                {/* Bottom Checkout Action Section */}
                <div className="pt-6 border-t border-white/5 mt-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-surface-custom-400 uppercase font-black tracking-widest text-[10px]">Total Final del Pedido</span>
                    <span className="text-primary-400 text-2xl font-black italic tracking-tighter">${finalTotal.toFixed(2)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedAddressId}
                    className={`w-full btn-premium gradient-primary text-white py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20 ${
                      isSubmitting || !selectedAddressId ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] hover:shadow-primary-500/40'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="font-bold flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando tu pedido...
                      </span>
                    ) : (
                      <>
                        <span className="font-bold">Confirmar Compra en Efectivo</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
