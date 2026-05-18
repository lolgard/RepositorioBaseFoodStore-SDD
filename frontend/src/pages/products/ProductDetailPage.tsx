import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Edit, Trash2, AlertTriangle, Plus, Minus, Info, X, Package } from 'lucide-react';
import { getProductById, deleteProduct, fetchCategoriesFlat, fetchIngredientsFlat } from '@/shared/api/product-api';
import ImageModal from '@/shared/ui/ImageModal';
import { ReviewList } from '@/widgets/reviews/ReviewList';
import { ReviewForm } from '@/widgets/reviews/ReviewForm';
import { Review } from '@/entities/review/types';
import { fetchProductReviews } from '@/shared/api/review-api';
import { useAuthStore } from '@/shared/store/auth-store';
import { useCartStore } from '@/shared/store/cart-store';
import { useToastStore } from '@/shared/store/toast-store';
import { isRoleAtLeast } from '@/shared/config/roles';
import type { Product, Category } from '@/entities/product/types';
import type { Ingredient } from '@/entities/ingredient/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const canManage = isRoleAtLeast(user?.role, 'STAFF');

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const [cartQty, setCartQty] = useState(1);
  const [excludedIngs, setExcludedIngs] = useState<number[]>([]);
  const [cartNotes, setCartNotes] = useState('');

  const loadProductData = async () => {
    if (!id) return;
    try {
      const [p, cats, ings, revs] = await Promise.all([
        getProductById(Number(id)),
        fetchCategoriesFlat(),
        fetchIngredientsFlat(),
        fetchProductReviews(Number(id)),
      ]);
      setProduct(p);
      setCategories(cats);
      setIngredients(ings);
      setReviews(revs);
    } catch {
      addToast('Error al cargar datos del producto', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id, navigate, addToast]);

  const handleDelete = async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id);
      addToast('Producto eliminado correctamente', 'success');
      navigate('/products');
    } catch {
      addToast('Error al eliminar producto', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
      <div className="p-6 card-premium inline-block">
        <Info className="text-red-400 mx-auto mb-4" size={48} />
        <h1 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Producto no encontrado</h1>
        <button
          onClick={() => navigate('/products')}
          className="btn-premium mt-6 flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={20} />
          Volver al catálogo
        </button>
      </div>
    </div>
  );

  const formatPrice = (price: string) => Number(price).toFixed(2);
  const productCategories = categories.filter((c) => product.category_ids.includes(c.id));
  const productIngredients = ingredients.filter((i) => product.ingredient_ids.includes(i.id));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="group flex items-center gap-1 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Catálogo</span>
        </button>
        <div className="flex items-center gap-2">
          {product.available ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Disponible
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
              No Disponible
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Product Info Section */}
        <div className="card-premium p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Package size={160} />
          </div>
          
          <div className="relative z-10 space-y-6">
            {/* Product Image */}
            <div className="h-80 w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group mb-6">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in hover:brightness-90"
                onClick={() => setPreviewOpen(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                {product.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                {productCategories.map((c) => (
                  <span key={c.id} className="text-[10px] font-black uppercase tracking-widest text-primary-400/70 border border-primary-500/20 px-2 py-0.5 rounded-lg bg-primary-500/5">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            {product.description && (
              <p className="text-surface-custom-400 text-lg leading-relaxed italic">
                "{product.description}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 block mb-1">Precio</span>
                <span className="text-white font-black text-3xl italic tracking-tighter flex items-center gap-1">
                  <span className="text-primary-400 text-xl font-bold">$</span>
                  {formatPrice(product.price)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 block mb-1">Stock Actual</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-black italic tracking-tighter ${product.stock > 0 ? 'text-white' : 'text-red-500'}`}>
                    {product.stock}
                  </span>
                  {product.stock === 0 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">Agotado</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500">Ingredientes</h3>
              {productIngredients.length === 0 ? (
                <p className="text-sm text-surface-custom-600 italic">No se listaron ingredientes.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {productIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        ing.es_alergeno 
                        ? 'bg-red-500/5 border-red-500/20 text-red-400/80 shadow-[0_0_10px_rgba(239,68,68,0.05)]' 
                        : 'bg-white/5 border-white/5 text-surface-custom-400'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${ing.es_alergeno ? 'bg-red-500 animate-pulse' : 'bg-surface-custom-600'}`} />
                      <span className="text-sm font-bold uppercase tracking-tight">{ing.name}</span>
                      {ing.es_alergeno && (
                        <AlertTriangle size={12} className="ml-auto text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Section (Cart or Admin) */}
        <div className="space-y-8">
          {user?.role === 'CLIENTE' && (
            <div className="card-premium p-8 space-y-6">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <ShoppingCart className="text-primary-400" size={24} />
                Armar Pedido
              </h2>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-custom-300 uppercase tracking-widest">Cantidad</span>
                  <div className="flex items-center gap-1 p-1 bg-surface-custom-950 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setCartQty(Math.max(1, cartQty - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center text-white font-black text-lg font-mono">{cartQty}</span>
                    <button
                      onClick={() => setCartQty(Math.min(99, cartQty + 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-custom-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {productIngredients.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-surface-custom-300 uppercase tracking-widest block mb-2">Excluir Ingredientes</label>
                    <div className="grid grid-cols-1 gap-2">
                      {productIngredients.map((ing) => (
                        <label 
                          key={ing.id} 
                          className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                            excludedIngs.includes(ing.id) 
                            ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={excludedIngs.includes(ing.id)}
                            onChange={() => {
                              setExcludedIngs((prev) =>
                                prev.includes(ing.id)
                                  ? prev.filter((id) => id !== ing.id)
                                  : [...prev, ing.id]
                              );
                            }}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            excludedIngs.includes(ing.id) ? 'bg-red-500 border-red-500' : 'border-surface-custom-700'
                          }`}>
                            {excludedIngs.includes(ing.id) && <X size={14} className="text-white" />}
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-tight ${excludedIngs.includes(ing.id) ? 'text-white' : 'text-surface-custom-400'}`}>
                            {ing.name}
                          </span>
                          {ing.es_alergeno && <AlertTriangle size={14} className="ml-auto text-red-500/50" />}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-surface-custom-300 uppercase tracking-widest block mb-2">Notas Especiales</label>
                  <textarea
                    placeholder="¿Alguna aclaración? (ej. bien cocido, sin aderezos...)"
                    value={cartNotes}
                    onChange={(e) => setCartNotes(e.target.value)}
                    className="input-premium h-24 resize-none"
                  />
                </div>

                <button
                  onClick={() => {
                    addItem({
                      product_id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: cartQty,
                      excluded_ingredients: excludedIngs,
                      notes: cartNotes,
                    });
                    addToast(`${product.name} agregado al carrito!`, 'success');
                    setCartQty(1);
                    setExcludedIngs([]);
                    setCartNotes('');
                  }}
                  disabled={product.stock === 0}
                  className="btn-premium w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingCart size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-lg font-black uppercase tracking-tighter italic">Agregar al Carrito</span>
                </button>
              </div>
            </div>
          )}

          {canManage && (
            <div className="card-premium p-8 space-y-6">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                <Edit className="text-primary-400" size={24} />
                Gestión de Admin
              </h2>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="w-full py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Editar Producto
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Eliminar Producto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ReviewForm productId={product.id} onReviewCreated={loadProductData} />
        <ReviewList reviews={reviews} />
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="absolute inset-0 bg-surface-custom-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="card-premium p-8 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-4 text-red-400 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">¿Confirmar Baja?</h3>
            </div>
            <p className="text-surface-custom-400 leading-relaxed italic mb-8">
              Estás por eliminar <span className="text-white font-bold">"{product.name}"</span>. Esta acción es irreversible y el producto desaparecerá del catálogo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {product && (
        <ImageModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          src={product.image_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop'}
        />
      )}
    </div>
  );
}
