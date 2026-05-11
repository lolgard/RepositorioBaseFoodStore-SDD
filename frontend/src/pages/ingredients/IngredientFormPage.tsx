import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIngredientById, createIngredient, updateIngredient } from '@/shared/api/ingredient-api';
import { useToastStore } from '@/shared/store/toast-store';
import type { IngredientCreate, IngredientUpdate } from '@/entities/ingredient/types';

export default function IngredientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [es_alergeno, setEsAlergeno] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (id) {
      getIngredientById(Number(id))
        .then((ing) => {
          setName(ing.name);
          setDescription(ing.description || '');
          setEsAlergeno(ing.es_alergeno);
        })
        .catch(() => {
          addToast('Ingredient not found', 'error');
          navigate('/ingredients');
        })
        .finally(() => setFetching(false));
    }
  }, [id, navigate, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        const data: IngredientUpdate = {
          name: name.trim(),
          description: description.trim() || null,
          es_alergeno,
        };
        await updateIngredient(Number(id), data);
        addToast('Ingredient updated successfully', 'success');
      } else {
        const data: IngredientCreate = {
          name: name.trim(),
          description: description.trim() || null,
          es_alergeno,
        };
        await createIngredient(data);
        addToast('Ingredient created successfully', 'success');
      }
      navigate('/ingredients');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Operation failed';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Ingredient' : 'New Ingredient'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Wheat flour"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Optional description"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="es_alergeno"
            checked={es_alergeno}
            onChange={(e) => setEsAlergeno(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="es_alergeno" className="text-sm font-medium">
            This is an allergen
          </label>
        </div>

        {es_alergeno && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            ⚠ This ingredient will be flagged as an allergen. Products containing
            it will display an allergen warning to customers.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/ingredients')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
