# Spec Delta: Midnight Theme UI

## MODIFIED Requirements

### Requirement: Global Visual Identity
**Original:** El sistema debe tener una interfaz clara y moderna basada en el diseño de FoodStore.
**Updated:** El sistema SHALL presentar una interfaz **Midnight Dark Mode** coherente en todas sus secciones, utilizando una paleta de colores basada en `surface-custom-950` para fondos y un sistema *glassmorphic* (`.glass`) para contenedores.

#### Scenario: Visual Consistency in Administrative Areas
- **Given:** Un usuario con rol de Administrador o Gestor
- **When:** Navega por el Dashboard, Configuración o Listado de Pedidos
- **Then:** El sistema SHALL renderizar todos los componentes con fondo oscuro
- **And:** Los textos SHALL utilizar la escala de blancos y grises claros (`surface-custom-400`) para garantizar el contraste.

#### Scenario: User Profile Consistency
- **Given:** Un cliente autenticado
- **When:** Accede a la edición de su perfil o sus direcciones de entrega
- **Then:** La UI SHALL mantener la estética Midnight Dark Mode, evitando el uso de fondos blancos sólidos.

## ADDED Requirements

### Requirement: Glassmorphic Modals
El sistema SHALL utilizar contenedores con efecto *backdrop-blur* y bordes traslúcidos para todas las ventanas modales y diálogos de acción, asegurando que el contenido sea legible sobre el fondo oscuro de la aplicación.
