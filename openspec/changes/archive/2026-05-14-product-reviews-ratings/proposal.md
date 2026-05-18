# Proposal: Product Reviews & Ratings

## Why
Los clientes necesitan una forma de expresar su satisfacción y otros clientes buscan validar su compra a través de la experiencia de otros. Esto genera confianza y mejora la conversión.

## What Changes
- Crear modelo de datos para `ProductReview` (rating 1-5, comment, user, product).
- Implementar endpoints API para crear, listar y eliminar reseñas.
- Implementar componente visual en el detalle del producto (`ProductDetailPage.tsx`).
- Añadir moderación administrativa (opcional).

## Impact
- Cambios en el backend (DB models, routers).
- Cambios en el frontend (visualización y formulario de review).
- Mejora en la experiencia de usuario y datos de feedback para admins.
