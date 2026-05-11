import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, deleteProduct, fetchCategoriesFlat, fetchIngredientsFlat } from '@/shared/api/product-api';
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
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const [cartQty, setCartQty] = useState(1);
  const [excludedIngs, setExcludedIngs] = useState<number[]>([]);
  const [cartNotes, setCartNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProductById(Number(id)),
      fetchCategoriesFlat(),
      fetchIngredientsFlat(),
    ])
      .then(([p, cats, ings]) => {
        setProduct(p);
        setCategories(cats);
        setIngredients(ings);
      })
      .catch(() => {
        addToast('Product not found', 'error');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, addToast]);

  const handleDelete = async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id);
      addToast('Product deleted successfully', 'success');
      navigate('/products');
    } catch {
      addToast('Failed to delete product', 'error');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        Product not found.
        <Link to="/products" className="block mt-2 text-blue-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const formatPrice = (price: string) => Number(price).toFixed(2);
  const productCategories = categories.filter((c) => product.category_ids.includes(c.id));
  const productIngredients = ingredients.filter((i) => product.ingredient_ids.includes(i.id));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/products" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to products
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.available ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
              Available
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-medium">
              Unavailable
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-gray-600 mb-6">{product.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-500 block">Price</span>
            <span className="text-xl font-semibold">${formatPrice(product.price)}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Stock</span>
            <span className={`text-xl font-semibold ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stock}
            </span>
            {product.stock === 0 && (
              <span className="text-xs text-red-500 ml-2">Out of stock</span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {productCategories.length === 0 ? (
              <span className="text-gray-400 text-sm">No categories assigned</span>
            ) : (
              productCategories.map((c) => (
                <span
                  key={c.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium"
                >
                  {c.name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ingredients</h3>
          {productIngredients.length === 0 ? (
            <span className="text-gray-400 text-sm">No ingredients listed</span>
          ) : (
            <ul className="space-y-1">
              {productIngredients.map((ing) => (
                <li
                  key={ing.id}
                  className={`text-sm ${ing.es_alergeno ? 'text-red-700 font-medium' : ''}`}
                >
                  {ing.name}
                  {ing.es_alergeno && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                      allergen
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add to Cart - CLIENTE */}
        {user?.role === 'CLIENTE' && (
          <div className="mb-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Add to Cart</h3>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-600">Quantity:</label>
              <button
                onClick={() => setCartQty(Math.max(1, cartQty - 1))}
                className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-10 text-center">{cartQty}</span>
              <button
                onClick={() => setCartQty(Math.min(99, cartQty + 1))}
                className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {productIngredients.length > 0 && (
              <div className="mb-3">
                <label className="text-sm text-gray-600 block mb-1">Exclude ingredients:</label>
                <div className="space-y-1">
                  {productIngredients.map((ing) => (
                    <label key={ing.id} className="flex items-center gap-2 text-sm">
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
                        className="rounded border-gray-300"
                      />
                      <span className={ing.es_alergeno ? 'text-red-700 font-medium' : ''}>
                        {ing.name}
                        {ing.es_alergeno && <span className="ml-1 text-xs text-red-500">(allergen)</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <textarea
                placeholder="Any notes? (optional)"
                value={cartNotes}
                onChange={(e) => setCartNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                rows={2}
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
                addToast(`${product.name} added to cart!`, 'success');
                setCartQty(1);
                setExcludedIngs([]);
                setCartNotes('');
              }}
              disabled={product.stock === 0}
              className={`px-6 py-2 rounded font-medium ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        )}

        {canManage && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => navigate(`/products/${product.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
