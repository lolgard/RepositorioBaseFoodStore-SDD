/**
 * CategoryListPage — displays hierarchical category tree with create/edit/delete.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      setError('Failed to load categories');
      addToast('Failed to load categories', 'error');
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
      if (!window.confirm(`Delete "${category.name}"? This action cannot be undone.`)) {
        return;
      }
      try {
        await deleteCategory(category.id);
        addToast(`"${category.name}" deleted successfully`, 'success');
        // Refresh the tree
        fetchTree();
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Failed to delete category';
        addToast(message, 'error');
      }
    },
    [addToast, fetchTree],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchTree}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product category hierarchy
            </p>
          </div>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => navigate('/categories/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors text-sm font-medium"
            >
              + Add Category
            </button>
          )}
        </div>

        {/* Category tree */}
        <CategoryTree
          nodes={tree}
          onEdit={isStaffOrAdmin ? handleEdit : undefined}
          onDelete={isStaffOrAdmin ? handleDelete : undefined}
        />
      </div>
    </div>
  );
}
