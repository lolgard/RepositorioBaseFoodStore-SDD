# Design: metrics-dashboard

## Backend

### Endpoints
- `GET /api/v1/admin/metrics/summary` → totales: usuarios, órdenes, ingresos, orden promedio
- `GET /api/v1/admin/metrics/sales-evolution?days=30` → ventas agrupadas por día
- `GET /api/v1/admin/metrics/top-products?limit=10` → ranking de productos más vendidos
- `GET /api/v1/admin/metrics/orders-by-status` → distribución de órdenes por estado

### Servicio
- `MetricsService` con queries agregadas sobre Order, OrderItem, User

## Frontend

### DashboardPage
- Ruta: `/admin/metrics`
- Cards con summary (totales)
- Tabla de evolución de ventas
- Ranking de productos (top N)
- Distribución por estados
- CSS simple (sin librería de charts)

### Nav
- Agregar "Metrics" para ADMIN
