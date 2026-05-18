import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingBasket, ChevronLeft, Save, DollarSign } from 'lucide-react';
import { getProductById, createProduct, updateProduct, fetchCategoriesFlat, fetchIngredientsFlat } from '@/shared/api/product-api';
import { useToastStore } from '@/shared/store/toast-store';
import ImageModal from '@/shared/ui/ImageModal';
import type { ProductCreate, ProductUpdate, Category } from '@/entities/product/types';
import type { Ingredient } from '@/entities/ingredient/types';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCategoriesFlat(),
      fetchIngredientsFlat(),
    ])
      .then(([cats, ings]) => {
        setCategories(cats);
        setIngredients(ings);
      })
      .catch(() => addToast('Error al cargar los datos del catálogo', 'error'))
      .finally(() => {
        if (!id) setFetching(false);
      });
  }, [id, addToast]);

  useEffect(() => {
    if (id) {
      getProductById(Number(id))
        .then((p) => {
          setName(p.name);
          setDescription(p.description || '');
          setPrice(p.price);
          setStock(String(p.stock));
          setAvailable(p.available);
          setSelectedCategoryIds(p.category_ids);
          setSelectedIngredientIds(p.ingredient_ids);
          setImageUrl(p.image_url || '');
        })
        .catch(() => {
          addToast('Producto no encontrado', 'error');
          navigate('/products');
        })
        .finally(() => setFetching(false));
    }
  }, [id, navigate, addToast]);

  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleIngredient = (ingId: number) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(ingId) ? prev.filter((id) => id !== ingId) : [...prev, ingId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('El nombre es obligatorio', 'error');
      return;
    }
    if (!price || Number(price) <= 0) {
      addToast('El precio debe ser mayor a 0', 'error');
      return;
    }
    if (Number(stock) < 0) {
      addToast('El stock no puede ser negativo', 'error');
      return;
    }
    if (name.trim().length > 200) {
      addToast('El nombre no puede superar los 200 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        const data: ProductUpdate = {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          available,
          image_url: imageUrl.trim() || null,
          category_ids: selectedCategoryIds,
          ingredient_ids: selectedIngredientIds,
        };
        await updateProduct(Number(id), data);
        addToast('Producto actualizado correctamente', 'success');
      } else {
        const data: ProductCreate = {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          available,
          image_url: imageUrl.trim() || null,
          category_ids: selectedCategoryIds,
          ingredient_ids: selectedIngredientIds,
        };
        await createProduct(data);
        addToast('Producto creado correctamente', 'success');
      }
      navigate('/products');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error en la operación';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="group flex items-center gap-2 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a Productos</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
            <ShoppingBasket className="text-primary-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-surface-custom-400 text-sm">Gestiona la ficha de producto, precios y relaciones.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Product Image Preview & URL Input */}
          <div className="space-y-4 md:col-span-2 border-b border-white/5 pb-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Vista previa del producto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-zoom-in hover:brightness-90"
                  onClick={() => setPreviewOpen(true)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop';
                  }}
                />
              ) : (
                <ShoppingBasket className="text-surface-custom-600 animate-pulse" size={48} />
              )}
            </div>
            <div className="flex-grow space-y-2 w-full">
              <label htmlFor="image_url" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
                Imagen del Producto (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="image_url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-premium text-sm"
                  placeholder="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest shrink-0"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <p className="text-[10px] text-surface-custom-500">Pega un enlace de imagen (opcional) para ilustrar el producto en el catálogo.</p>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="name"
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium"
              placeholder="Ej: Hamburguesa Triple Queso, Ensalada César..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Descripción del Producto
            </label>
            <textarea
              id="description"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-premium h-24 resize-none"
              placeholder="Añade una descripción tentadora para los clientes..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Precio (ARS) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-500 pointer-events-none" size={18} />
              <input
                type="number"
                id="price"
                required
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-premium pl-12"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Stock Inicial
            </label>
            <input
              type="number"
              id="stock"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="input-premium"
              placeholder="0"
            />
          </div>

          {/* Categories multi-select */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">Categorías</label>
            <div className="border border-white/10 bg-surface-custom-900/40 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-surface-custom-500 italic p-2">No hay categorías disponibles</p>
              ) : (
                categories.map((cat) => (
                  <label key={cat.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedCategoryIds.includes(cat.id)
                      ? 'bg-primary-500/10 border-primary-500/30 text-white'
                      : 'bg-white/5 border-white/5 text-surface-custom-400 hover:border-white/10 hover:text-white'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      selectedCategoryIds.includes(cat.id) ? 'bg-primary-500 border-primary-500' : 'border-surface-custom-700'
                    }`}>
                      {selectedCategoryIds.includes(cat.id) && <Save size={10} className="text-white" />}
                    </div>
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Ingredients multi-select */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">Ingredientes</label>
            <div className="border border-white/10 bg-surface-custom-900/40 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2">
              {ingredients.length === 0 ? (
                <p className="text-sm text-surface-custom-500 italic p-2">No hay ingredientes disponibles</p>
              ) : (
                ingredients.map((ing) => (
                  <label
                    key={ing.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedIngredientIds.includes(ing.id)
                        ? ing.es_alergeno
                          ? 'bg-red-500/10 border-red-500/30 text-red-200'
                          : 'bg-primary-500/10 border-primary-500/30 text-white'
                        : 'bg-white/5 border-white/5 text-surface-custom-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIngredientIds.includes(ing.id)}
                      onChange={() => toggleIngredient(ing.id)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      selectedIngredientIds.includes(ing.id)
                        ? ing.es_alergeno
                          ? 'bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                          : 'bg-primary-500 border-primary-500 shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]'
                        : 'border-surface-custom-700'
                    }`}>
                      {selectedIngredientIds.includes(ing.id) && <Save size={10} className="text-white" />}
                    </div>
                    <span className="text-sm font-semibold">{ing.name}</span>
                    {ing.es_alergeno && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ml-auto shrink-0">
                        Alérgeno
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all self-start ${
            available ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'
          }`}>
            <input
              type="checkbox"
              id="available"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
              available ? 'bg-emerald-500 border-emerald-500' : 'border-surface-custom-700'
            }`}>
              {available && <Save size={12} className="text-white" />}
            </div>
            <span className={`text-sm font-black uppercase tracking-widest ${available ? 'text-emerald-400' : 'text-surface-custom-500'}`}>
              Producto Disponible para la Venta
            </span>
          </label>

          <div className="flex gap-3 justify-end w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-premium flex items-center gap-2 px-8 shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
            </button>
          </div>
        </div>
      </form>
      <ImageModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'}
      />
    </div>
  );
}
