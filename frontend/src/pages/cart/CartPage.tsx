import { useCartStore, getTotalItems, getSubtotal } from '@/shared/store/cart-store';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const totalItems = getTotalItems(items);
  const subtotal = getSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-blue-600 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart ({totalItems} items)</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const sortedExcluded = [...item.excluded_ingredients].sort();
          return (
            <div
              key={`${item.product_id}-${sortedExcluded.join(',')}`}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">${Number(item.price).toFixed(2)} each</p>

                  {item.excluded_ingredients.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Excluded: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.excluded_ingredients.map((ingId) => (
                          <span key={ingId} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            Ingredient #{ingId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">Note: {item.notes}</p>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center text-lg font-bold mb-4">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          disabled
          className="w-full py-3 bg-gray-300 text-gray-500 rounded font-medium cursor-not-allowed"
          title="Coming soon"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
