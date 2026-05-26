import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Info, Package, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/shared/store/cart-store';
import { useToastStore } from '@/shared/store/toast-store';
import { ReviewForm } from '@/widgets/reviews/ReviewForm';
import type { Product } from '@/entities/product/types';
import type { Ingredient } from '@/entities/ingredient/types';

interface ProductModalProps {
  product: Product;
  ingredients: Ingredient[];
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated?: () => void;
}

export function ProductModal({ product, ingredients, isOpen, onClose, onProductUpdated }: ProductModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  
  const [cartQty, setCartQty] = useState(1);
  const [excludedIngs, setExcludedIngs] = useState<number[]>([]);
  const [cartNotes, setCartNotes] = useState('');

  const productIngredients = ingredients.filter((i) => product.ingredient_ids.includes(i.id));
  const formatPrice = (price: string) => Number(price).toFixed(2);

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: cartQty,
      excluded_ingredients: excludedIngs,
      notes: cartNotes,
    });
    addToast(`${product.name} agregado al carrito!`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-surface-custom-900 border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-surface-custom-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X size={24} />
            </button>

            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow space-y-2">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{product.name}</h2>
                  <p className="text-primary-400 font-bold text-xl">${formatPrice(product.price)}</p>
                  <p className="text-surface-custom-400 text-sm line-clamp-2">{product.description}</p>
                </div>
              </div>

              {/* Add to cart section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-custom-300 uppercase tracking-widest">Cantidad</span>
                  <div className="flex items-center gap-1 p-1 bg-surface-custom-950 rounded-2xl border border-white/5">
                    <button onClick={() => setCartQty(Math.max(1, cartQty - 1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"><Minus size={18} /></button>
                    <span className="w-12 text-center text-white font-black text-lg font-mono">{cartQty}</span>
                    <button onClick={() => setCartQty(Math.min(99, cartQty + 1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"><Plus size={18} /></button>
                  </div>
                </div>

                {productIngredients.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-surface-custom-300 uppercase tracking-widest block mb-2">Excluir Ingredientes</label>
                    <div className="grid grid-cols-2 gap-2">
                      {productIngredients.map((ing) => (
                        <label key={ing.id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${excludedIngs.includes(ing.id) ? 'bg-red-500/10 border-red-500/40' : 'bg-white/5 border-white/10'}`}>
                          <input type="checkbox" checked={excludedIngs.includes(ing.id)} onChange={() => setExcludedIngs(prev => prev.includes(ing.id) ? prev.filter(id => id !== ing.id) : [...prev, ing.id])} className="hidden" />
                          <span className="text-xs font-bold text-surface-custom-400">{ing.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <textarea placeholder="Notas especiales..." value={cartNotes} onChange={(e) => setCartNotes(e.target.value)} className="input-premium w-full h-20 resize-none" />

                <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-premium w-full py-4 font-black uppercase tracking-tighter italic">
                  Agregar al Carrito
                </button>
              </div>

              {/* Review section */}
              <ReviewForm productId={product.id} onReviewCreated={onProductUpdated || (() => {})} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
