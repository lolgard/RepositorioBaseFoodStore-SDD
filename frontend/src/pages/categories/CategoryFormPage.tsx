import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderTree, ChevronLeft, Save, Info, Link as LinkIcon, Layers } from 'lucide-react';
import { useToastStore } from '@/shared/store/toast-store';
import { getCategoryTree, getCategoryById, createCategory, updateCategory } from '@/shared/api/category-api';
import type { CategoryCreate, CategoryTreeNode, CategoryUpdate } from '@/entities/category/types';

interface FormData {
  name: string;
  description: string;
  image_url: string;
  parent_id: string; // string because select value
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  image_url: '',
  parent_id: '',
  sort_order: 0,
  is_active: true,
};

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [treeOptions, setTreeOptions] = useState<CategoryTreeNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  // Fetch tree for parent selector
  useEffect(() => {
    getCategoryTree()
      .then(setTreeOptions)
      .catch(() => { /* non-critical */ });
  }, []);

  // If editing, load existing category data
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getCategoryById(Number(id))
      .then((category) => {
        setFormData({
          name: category.name,
          description: category.description ?? '',
          image_url: category.image_url ?? '',
          parent_id: category.parent_id?.toString() ?? '',
          sort_order: category.sort_order,
          is_active: category.is_active,
        });
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || 'Categoría no encontrada';
        setError(msg);
        addToast(msg, 'error');
      })
      .finally(() => setIsLoading(false));
  }, [id, addToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'sort_order'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CategoryCreate | CategoryUpdate = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (isEditing) {
        await updateCategory(Number(id), payload as CategoryUpdate);
        addToast('Categoría actualizada', 'success');
      } else {
        await createCategory(payload as CategoryCreate);
        addToast('Categoría creada', 'success');
      }
      navigate('/categories');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Error en la operación';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/categories')}
          className="group flex items-center gap-2 text-surface-custom-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a Categorías</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
            <FolderTree className="text-primary-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h1>
            <p className="text-surface-custom-400 text-sm">Define la jerarquía y visualización del grupo.</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
          <Info className="text-red-400 shrink-0" size={20} />
          <p className="text-sm text-red-400/80 italic">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="input-premium"
              placeholder="Ej: Hamburguesas, Bebidas..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-premium h-24 resize-none"
              placeholder="Añade una breve descripción para el catálogo..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="parent_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Categoría Padre
            </label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-500 pointer-events-none" size={18} />
              <select
                id="parent_id"
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="input-premium pl-12 appearance-none cursor-pointer"
              >
                <option value="">Ninguna (Nivel Raíz)</option>
                {renderParentOptions(treeOptions, formData.parent_id, isEditing ? Number(id) : undefined)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sort_order" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              Orden de Visualización
            </label>
            <input
              type="number"
              id="sort_order"
              name="sort_order"
              min={0}
              value={formData.sort_order}
              onChange={handleChange}
              className="input-premium"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="image_url" className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 ml-1">
              URL de la Imagen (Opcional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-500 pointer-events-none" size={18} />
              <input
                type="url"
                id="image_url"
                name="image_url"
                maxLength={500}
                value={formData.image_url}
                onChange={handleChange}
                className="input-premium pl-12"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
            formData.is_active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'
          }`}>
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
              formData.is_active ? 'bg-emerald-500 border-emerald-500' : 'border-surface-custom-700'
            }`}>
              {formData.is_active && <Save size={12} className="text-white" />}
            </div>
            <span className={`text-sm font-black uppercase tracking-widest ${formData.is_active ? 'text-emerald-400' : 'text-surface-custom-500'}`}>
              Categoría Activa
            </span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="px-6 py-4 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium flex items-center gap-2 px-8 shadow-lg shadow-primary-500/20"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function renderParentOptions(
  nodes: CategoryTreeNode[],
  selectedParentId: string,
  currentCategoryId?: number,
  depth = 0,
): React.ReactNode[] {
  const options: React.ReactNode[] = [];

  for (const node of nodes) {
    if (node.id === currentCategoryId) continue;

    const indent = '\u00A0\u00A0'.repeat(depth * 2);
    options.push(
      <option key={node.id} value={node.id} className="bg-surface-custom-900">
        {indent}{node.name}
      </option>,
    );

    if (node.children.length > 0) {
      options.push(
        ...renderParentOptions(node.children, selectedParentId, currentCategoryId, depth + 1),
      );
    }
  }

  return options;
}
