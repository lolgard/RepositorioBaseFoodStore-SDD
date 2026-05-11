# Design: shopping-cart

## Arquitectura
100% client-side. Sin backend. Zustand store con `persist` middleware (localStorage).

## Store (shared/store/cart-store.ts)

### State
```typescript
interface CartState {
  items: CartItem[];
  loaded: boolean;
}
```

### CartItem
```typescript
interface CartItem {
  product_id: number;
  name: string;
  price: string; // NUMERIC del backend viene como string
  quantity: number;
  image?: string;
  excluded_ingredients: number[]; // IDs de ingredientes a excluir
  notes: string;
}
```

### Actions
- `addItem(product, quantity, excludedIngredients, notes)`: agrega o incrementa si ya existe
- `removeItem(productId)`: elimina del carrito
- `updateQuantity(productId, quantity)`: cambia cantidad (si 0, elimina)
- `toggleExcludedIngredient(productId, ingredientId)`: agrega/saca ingrediente excluido
- `setNotes(productId, notes)`: actualiza notas
- `clearCart()`: vacía el carrito

### Computed / Getters
- `totalItems`: suma de cantidades
- `subtotal`: suma de price * quantity de cada item
- `itemCount`: cantidad de items distintos

## Persistencia
- Middleware `persist` de Zustand con `localStorage`
- Key: `food-store-cart`

## Páginas

### CartPage (pages/cart/CartPage.tsx)
- Lista de items en el carrito
- Cada item muestra: nombre, precio, cantidad (+/-), subtotal por item
- Botón para eliminar item
- Sección de ingredientes excluidos (si hay)
- Notas por item
- Resumen: subtotal total
- Botón "Proceed to Checkout" (deshabilitado por ahora, sin订单creation)

### Botón "Add to Cart" en ProductDetailPage
- Selector de cantidad
- Lista de ingredientes con checkboxes para excluir
- Campo de notas
- Botón "Add to Cart"
- Feedback visual de éxito

### Cart Badge en AppLayout
- Ícono de carrito en el header con badge de cantidad
- Link a /cart

## Router (app/router.tsx)
- `/cart` → CartPage (protegida, CLIENTE)

## Navigation (shared/config/navigation.ts)
- Agregar "Cart" para CLIENTE
