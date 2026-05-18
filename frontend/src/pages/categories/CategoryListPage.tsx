import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderTree, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';
import { getCategoryTree, deleteCategory } from '@/shared/api/category-api';
import { CategoryTree } from '@/widgets/categories/CategoryTree';
import type { CategoryTreeNode } from '@/entities/category/types';

export default function CategoryListPage() {
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToast = useToastStore((state) => state.addToast);

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const fetchTree = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategoryTree();
      setTree(data);
    } catch (err) {
      setError('Error al cargar categorías');
      addToast('No se pudieron cargar las categorías', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleEdit = useCallback(
    (category: CategoryTreeNode) => {
      navigate(`/categories/${category.id}/edit`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    async (category: CategoryTreeNode) => {
      // Usaremos un prompt nativo pero estilizado visualmente si fuera posible, 
      // por ahora mantenemos el flujo funcional con aviso Midnight.
      if (!window.confirm(`¿Eliminar "${category.name}"? Esta acción no se puede deshacer.`)) {
        return;
      }
      try {
        await deleteCategory(category.id);
        addToast(`"${category.name}" eliminada correctamente`, 'success');
        fetchTree();
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Error al eliminar categoría';
        addToast(message, 'error');
      }
    },
    [addToast, fetchTree],
  );

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="card-premium h-[400px] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="card-premium p-8 border-red-500/20 flex flex-col items-center text-center space-y-4">
          <AlertCircle className="text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter">{error}</h2>
          <button
            type="button"
            onClick={fetchTree}
            className="text-primary-400 font-bold hover:underline"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
            <FolderTree className="text-primary-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Categorías</h1>
            <p className="text-surface-custom-400 text-sm">Gestiona la jerarquía y organización del catálogo.</p>
          </div>
        </div>

        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={() => navigate('/categories/new')}
            className="btn-premium flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Category tree container */}
      <div className="card-premium p-6 md:p-8">
        <CategoryTree
          nodes={tree}
          onEdit={isStaffOrAdmin ? handleEdit : undefined}
          onDelete={isStaffOrAdmin ? handleDelete : undefined}
        />
      </div>
    </div>
  );
}
