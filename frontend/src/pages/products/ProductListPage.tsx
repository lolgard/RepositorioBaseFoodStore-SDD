import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ShoppingBasket, 
  ChevronLeft, 
  ChevronRight,
  PackageX,
  Tag
} from 'lucide-react';
import { listProducts, deleteProduct, fetchCategoriesFlat } from '@/shared/api/product-api';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';
import { useCartStore } from '@/shared/store/cart-store';
import { isRoleAtLeast } from '@/shared/config/roles';
import type { Product, Category } from '@/entities/product/types';

export default function ProductListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const addItem = useCartStore((s) => s.addItem);
  const canManage = isRoleAtLeast(user?.role, 'STAFF');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [available, setAvailable] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 12;

  useEffect(() => {
    fetchCategoriesFlat()
      .then(setCategories)
      .catch(() => addToast('Failed to load categories', 'error'));
  }, [addToast]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { skip: page * limit, limit };
      if (search) params.search = search;
      if (categoryId !== undefined) params.category_id = categoryId;
      if (available !== undefined) params.available = available;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);

      const data = await listProducts(params);
      setProducts(data.items);
      setTotal(data.total);
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, available, minPrice, maxPrice, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct(deleteId);
      addToast('Producto eliminado correctamente', 'success');
      setDeleteId(null);
      fetchProducts();
    } catch {
      addToast('Error al eliminar producto', 'error');
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
    addToast(`${product.name} agregado al carrito`, 'success');
  };

  const formatPrice = (price: string) => Number(price).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Nuestros Productos</h1>
          <p className="text-surface-custom-400 mt-1">Explorá nuestra selección premium de alimentos frescos.</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate('/products/new')}
            className="btn-premium gradient-primary text-white flex items-center space-x-2 shadow-lg shadow-primary-500/20"
          >
            <Plus size={20} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Modern Filters */}
      <div className="glass rounded-3xl p-6 shadow-xl border border-white/5">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-12 pr-4 py-3 bg-surface-custom-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-white placeholder:text-surface-custom-600"
            />
          </div>
          
          <select
            value={categoryId ?? ''}
            onChange={(e) => { setCategoryId(e.target.value === '' ? undefined : Number(e.target.value)); setPage(0); }}
            className="px-4 py-3 bg-surface-custom-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-surface-custom-300 font-medium cursor-pointer"
          >
            <option value="" className="bg-surface-custom-900">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface-custom-900">{c.name}</option>
            ))}
          </select>

          <select
            value={available === undefined ? '' : available.toString()}
            onChange={(e) => {
              setAvailable(e.target.value === '' ? undefined : e.target.value === 'true');
              setPage(0);
            }}
            className="px-4 py-3 bg-surface-custom-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-surface-custom-300 font-medium cursor-pointer"
          >
            <option value="" className="bg-surface-custom-900">Disponibilidad</option>
            <option value="true" className="bg-surface-custom-900">Solo Disponibles</option>
            <option value="false" className="bg-surface-custom-900">Agotados</option>
          </select>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-custom-500 text-sm">$</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(0); }}
                className="pl-7 pr-3 py-3 w-24 bg-surface-custom-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-white"
              />
            </div>
            <span className="text-surface-custom-700">—</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-custom-500 text-sm">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }}
                className="pl-7 pr-3 py-3 w-24 bg-surface-custom-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-[420px] rounded-3xl bg-surface-custom-900/50 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-surface-custom-600">
            <PackageX size={40} />
          </div>
          <p className="text-xl font-bold text-surface-custom-500">No se encontraron productos</p>
          <button 
            onClick={() => { setSearch(''); setCategoryId(undefined); setAvailable(undefined); }}
            className="text-primary-400 font-bold hover:text-primary-300 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {products.map((p) => (
            <motion.div 
              key={p.id} 
              variants={itemAnim}
              className="card-premium group overflow-hidden flex flex-col cursor-pointer"
              onClick={() => navigate(`/products/${p.id}`)}
            >
              {/* Product Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={p.image_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop'} 
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-custom-950 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white">
                    <Eye size={24} />
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {!p.available && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                      Agotado
                    </span>
                  )}
                  {p.stock < 5 && p.stock > 0 && (
                    <span className="bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                      Últimas unidades
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-grow flex flex-col space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="font-black text-primary-400 whitespace-nowrap">
                    {formatPrice(p.price)}
                  </p>
                </div>
                
                <p className="text-sm text-surface-custom-400 line-clamp-2 leading-relaxed h-10">
                  {p.description || 'Sin descripción disponible para este producto gourmet.'}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {categories.filter((c) => p.category_ids.includes(c.id)).slice(0, 2).map((c) => (
                    <span key={c.id} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white/5 text-surface-custom-400 text-[10px] font-bold rounded-full border border-white/5">
                      <Tag size={10} />
                      <span>{c.name}</span>
                    </span>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-auto">
                  <div className="flex items-center space-x-2">
                    {canManage ? (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}/edit`); }}
                          className="p-2 text-surface-custom-500 hover:text-primary-400 hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                          className="p-2 text-surface-custom-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-surface-custom-500 font-bold uppercase tracking-widest">
                        {p.stock} en stock
                      </span>
                    )}
                  </div>
                  
                  <button
                    disabled={!p.available || p.stock === 0}
                    onClick={(e) => handleAddToCart(e, p)}
                    className={`p-3 rounded-xl transition-all shadow-lg ${
                      p.available && p.stock > 0
                        ? 'gradient-primary text-white hover:shadow-primary-500/20 hover:-translate-y-0.5 active:scale-95'
                        : 'bg-white/5 text-surface-custom-600 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBasket size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-white/5">
        <p className="text-sm text-surface-custom-500">
          Mostrando <span className="font-bold text-white">{total === 0 ? 0 : Math.min((page * limit) + 1, total)}</span> a <span className="font-bold text-white">{Math.min((page + 1) * limit, total)}</span> de <span className="font-bold text-white">{total}</span> productos
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === 0}
            className="p-2 rounded-xl border border-white/10 text-surface-custom-400 hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center space-x-1">
            {[...Array(Math.ceil(total / limit))].map((_, i) => (
              <button
                key={i}
                onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  page === i 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20' 
                    : 'text-surface-custom-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={(page + 1) * limit >= total}
            className="p-2 rounded-xl border border-white/10 text-surface-custom-400 hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Delete confirmation modal (Midnight Glass) */}
      <AnimatePresence>
        {deleteId !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface-custom-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 -mr-8 -mt-8">
                <Trash2 size={120} />
              </div>
              <div className="relative space-y-6">
                <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-3xl flex items-center justify-center">
                  <Trash2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Eliminar Producto</h3>
                  <p className="text-surface-custom-400 mt-2 leading-relaxed">
                    ¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer y desaparecerá de la tienda.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-surface-custom-300 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
