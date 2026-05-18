# Proposal: Midnight Theme Unification

## Why
Tras la implementación exitosa del modo oscuro ("Midnight Dark Mode") en las páginas principales (Home, Login, Catálogo), se detectó que varias secciones críticas de la aplicación (Admin Dashboard, Perfil de Usuario, Direcciones, Gestión de Pedidos) aún conservan el diseño claro original o carecen de los refinamientos estéticos del nuevo sistema de diseño. Esto genera una experiencia de usuario fragmentada y visualmente inconsistente.

## What Changes
- **Unificación de Componentes Administrativos:** Refactorización de todas las tablas, formularios y tarjetas en el panel de administración para usar el sistema `.glass` oscuro y `.card-premium`.
- **Refactorización de Perfil y Direcciones:** Adaptación de las vistas de gestión de perfil y direcciones de entrega al esquema Midnight.
- **Optimización de Contraste:** Asegurar que todos los textos secundarios y labels usen la escala `surface-custom-400` para legibilidad.
- **Actualización de Modales:** Unificación de todas las ventanas modales y diálogos de confirmación al estilo "Midnight Glass".

## Impact
- **UI/UX:** Consistencia visual del 100% en toda la plataforma.
- **Frontend:** Modificación de múltiples componentes de páginas en `src/pages/admin`, `src/pages/addresses`, y `src/pages/orders`.
- **Estilos:** Uso intensivo de las utilidades definidas en `index.css`.
