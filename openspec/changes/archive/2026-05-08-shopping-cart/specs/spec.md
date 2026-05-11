# Specification: Shopping Cart

## Store (Zustand + localStorage)

### CartItem
| Field | Type | Description |
|-------|------|-------------|
| product_id | number | ID del producto |
| name | string | Nombre del producto (snapshot) |
| price | string | Precio como string (NUMERIC del backend) |
| quantity | number | Cantidad (min 1) |
| excluded_ingredients | number[] | IDs de ingredientes excluidos |
| notes | string | Notas del cliente para este item |

### Actions
| Action | Params | Description |
|--------|--------|-------------|
| addItem | product, quantity, excludedIngredients, notes | Agrega al carrito. Si ya existe el mismo producto con mismos ingredientes excluidos, incrementa quantity |
| removeItem | productId | Elimina el item del carrito |
| updateQuantity | productId, quantity | Cambia cantidad. Si quantity <= 0, elimina |
| toggleExcludedIngredient | productId, ingredientId | Agrega o saca un ingrediente de la lista de excluidos |
| setNotes | productId, notes | Actualiza las notas del item |
| clearCart | - | Vacía el carrito completamente |

### Persistence
- Middleware `persist` de Zustand
- Storage: `localStorage` con key `food-store-cart`

## UI

### Cart Page (/cart)
- **Header**: "Shopping Cart" con cantidad total
- **Lista de items**: cada uno con imagen (placeholder), nombre, precio unitario, selector de cantidad (+/-), subtotal, botón eliminar
- **Ingredientes excluidos**: si hay, mostrarlos como tags rojos pequeños
- **Notas**: texto pequeño si hay
- **Resumen**: subtotal total, botón "Proceed to Checkout" (placeholder)

### Product Detail - Add to Cart
- Selector de cantidad (1-99)
- Lista de ingredientes con checkbox: "Exclude [ingredient name]"
- Campo de texto "Notes"
- Botón "Add to Cart" → muestra toast/feedback "Added!"

### Navigation
- Badge en el header con el count total de items
- Link al carrito visible para CLIENTE

## Edge Cases
- Producto duplicado con mismos ingredientes excluidos → incrementa quantity
- Producto duplicado con DIFERENTES ingredientes excluidos → nuevo item separado
- Al cambiar ingredientes excluidos de un item existente, se trata como un item diferente
- Si quantity llega a 0, el item se elimina automáticamente
- Persiste entre sesiones (localStorage)
