import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/entities/cart/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: { product_id: number; name: string; price: string; excluded_ingredients?: number[]; notes?: string; quantity?: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

function itemKey(item: { product_id: number; excluded_ingredients?: number[] }): string {
  return `${item.product_id}-${(item.excluded_ingredients || []).sort().join(',')}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get();
        const key = itemKey(newItem);
        const existingIdx = items.findIndex((i) => itemKey(i) === key);

        if (existingIdx >= 0) {
          const updated = [...items];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: newItem.product_id,
                name: newItem.name,
                price: newItem.price,
                quantity: newItem.quantity || 1,
                excluded_ingredients: newItem.excluded_ingredients || [],
                notes: newItem.notes || '',
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product_id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product_id !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'food-store-cart',
    }
  )
);

export function getTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
}
