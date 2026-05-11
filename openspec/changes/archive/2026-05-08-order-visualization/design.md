# Design: order-visualization

## Frontend

### Pages
- `pages/orders/OrderListPage.tsx`: tabla/tarjetas de pedidos. Cliente ve los suyos. Staff/Gestor/Admin ve todos con filtros (estado, fecha, usuario).
- `pages/orders/OrderDetailPage.tsx`: detalle completo con items (snapshots), dirección (snapshot), historial de estados, información del pago.

### Router
- `/orders` → OrderListPage
- `/orders/{id}` → OrderDetailPage
- Cliente: acceso a sus pedidos.
- Gestor/Admin: acceso a todos.

### Navigation
- Agregar "Orders" para CLIENTE, GESTOR, ADMIN.

### API Client
- `order-api.ts`: funciones para listar y obtener pedidos (usando endpoints existentes).
