import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listIngredients, deleteIngredient } from '@/shared/api/ingredient-api';
import { useToastStore } from '@/shared/store/toast-store';
import type { Ingredient } from '@/entities/ingredient/types';

export default function IngredientListPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAlergeno, setFilterAlergeno] = useState<boolean | null>(null);
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 20;

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { skip: page * limit, limit };
      if (search) params.search = search;
      if (filterAlergeno !== null) params.es_alergeno = filterAlergeno;

      const data = await listIngredients(params);
      setIngredients(data.items);
      setTotal(data.total);
    } catch {
      addToast('Failed to load ingredients', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAlergeno, addToast]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteIngredient(deleteId);
      addToast('Ingredient deleted successfully', 'success');
      setDeleteId(null);
      fetchIngredients();
    } catch {
      addToast('Failed to delete ingredient', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        <button
          onClick={() => navigate('/ingredients/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Ingredient
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border rounded px-3 py-2 flex-1 max-w-xs"
        />
        <select
          value={filterAlergeno === null ? '' : filterAlergeno.toString()}
          onChange={(e) => {
            setFilterAlergeno(e.target.value === '' ? null : e.target.value === 'true');
            setPage(0);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">All ingredients</option>
          <option value="true">Allergens only</option>
          <option value="false">Non-allergens only</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No ingredients found. Create your first ingredient!
        </div>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border-b">Name</th>
                <th className="text-left p-3 border-b">Description</th>
                <th className="text-left p-3 border-b">Allergen</th>
                <th className="text-right p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3 font-medium">{ing.name}</td>
                  <td className="p-3 text-gray-600">{ing.description || '—'}</td>
                  <td className="p-3">
                    {ing.es_alergeno ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                        ⚠ Allergen
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/ingredients/${ing.id}/edit`)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(ing.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-600">
              Showing {Math.min((page * limit) + 1, total)}–{Math.min((page + 1) * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this ingredient? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
