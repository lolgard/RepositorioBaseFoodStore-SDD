export interface CartItem {
  product_id: number;
  name: string;
  price: string;
  quantity: number;
  excluded_ingredients: number[];
  notes: string;
}

export interface CartState {
  items: CartItem[];
  loaded: boolean;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}
