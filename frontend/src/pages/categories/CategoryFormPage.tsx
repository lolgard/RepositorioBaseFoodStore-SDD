/**
 * CategoryFormPage — create or edit a category with parent selector dropdown.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        const msg = err?.response?.data?.detail || 'Category not found';
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
        addToast('Category updated successfully', 'success');
      } else {
        await createCategory(payload as CategoryCreate);
        addToast('Category created successfully', 'success');
      }
      navigate('/categories');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Operation failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            &larr; Back to Categories
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Category' : 'Add Category'}
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Beverages"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description"
            />
          </div>

          {/* Parent selector */}
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None (root category)</option>
              {renderParentOptions(treeOptions, formData.parent_id, isEditing ? Number(id) : undefined)}
            </select>
          </div>

          {/* Sort order */}
          <div>
            <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              id="sort_order"
              name="sort_order"
              min={0}
              value={formData.sort_order}
              onChange={handleChange}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              maxLength={500}
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.png"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Recursively render <option> elements for the parent selector.
 * Excludes the current category (to prevent self-reference) and its descendants.
 */
function renderParentOptions(
  nodes: CategoryTreeNode[],
  selectedParentId: string,
  currentCategoryId?: number,
  depth = 0,
): React.ReactNode[] {
  const options: React.ReactNode[] = [];

  for (const node of nodes) {
    // Skip the current category and its children to prevent circular reference
    if (node.id === currentCategoryId) continue;

    const indent = '\u00A0\u00A0'.repeat(depth);
    options.push(
      <option key={node.id} value={node.id}>
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
