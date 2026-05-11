import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, createProduct, updateProduct, fetchCategoriesFlat, fetchIngredientsFlat } from '@/shared/api/product-api';
import { useToastStore } from '@/shared/store/toast-store';
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
      .catch(() => addToast('Failed to load form data', 'error'))
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
        })
        .catch(() => {
          addToast('Product not found', 'error');
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
      addToast('Name is required', 'error');
      return;
    }
    if (!price || Number(price) <= 0) {
      addToast('Price must be greater than 0', 'error');
      return;
    }
    if (Number(stock) < 0) {
      addToast('Stock cannot be negative', 'error');
      return;
    }
    if (name.trim().length > 200) {
      addToast('Name must be at most 200 characters', 'error');
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
          category_ids: selectedCategoryIds,
          ingredient_ids: selectedIngredientIds,
        };
        await updateProduct(Number(id), data);
        addToast('Product updated successfully', 'success');
      } else {
        const data: ProductCreate = {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stock: Number(stock),
          available,
          category_ids: selectedCategoryIds,
          ingredient_ids: selectedIngredientIds,
        };
        await createProduct(data);
        addToast('Product created successfully', 'success');
      }
      navigate('/products');
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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Product' : 'New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Classic Burger"
            required
            maxLength={200}
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
            maxLength={2000}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border rounded px-3 py-2"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="available"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="available" className="text-sm font-medium">
            Product is available
          </label>
        </div>

        {/* Categories multi-select */}
        <div>
          <label className="block text-sm font-medium mb-1">Categories</label>
          <div className="border rounded p-3 max-h-40 overflow-y-auto space-y-1">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">No categories available</p>
            ) : (
              categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4"
                  />
                  {cat.name}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Ingredients multi-select */}
        <div>
          <label className="block text-sm font-medium mb-1">Ingredients</label>
          <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-1">
            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-400">No ingredients available</p>
            ) : (
              ingredients.map((ing) => (
                <label
                  key={ing.id}
                  className={`flex items-center gap-2 cursor-pointer text-sm ${
                    ing.es_alergeno ? 'text-red-700' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIngredientIds.includes(ing.id)}
                    onChange={() => toggleIngredient(ing.id)}
                    className="w-4 h-4"
                  />
                  {ing.name}
                  {ing.es_alergeno && (
                    <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium">
                      allergen
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
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
