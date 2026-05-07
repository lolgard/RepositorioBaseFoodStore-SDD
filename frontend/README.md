# Food Store — Frontend

Frontend construido con **React** + **TypeScript** + **Vite**.

## 🛠️ Tech Stack

- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Zustand** - Estado del cliente
- **TanStack Query** - Estado del servidor
- **Axios** - Peticiones HTTP
- **Tailwind CSS** - Estilos
- **React Router v6** - Navegación
- **Vitest** - Tests

## 📁 Estructura (Feature-Sliced Design)

```
src/
├── app/           # Providers, router, layouts
├── pages/         # Page components
├── widgets/       # Shared UI widgets
├── features/      # Feature modules
├── entities/      # Domain models & types
└── shared/        # API client, stores, utilities
```

## 🚀 Scripts

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev          # Inicia servidor Vite

# Build
npm run build        # TypeScript check + Vite build

# Preview
npm run preview      # Preview build

# Tests
npm test             # Ejecuta Vitest
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Modo watch
npx vitest
```

## 🎨 Tailwind CSS

Este proyecto usa **Tailwind CSS** con una paleta de colores personalizada:

- `primary` - Color principal de la marca
- `secondary` - Color secundario
- `accent` - Color de acento

Configuración completa en `tailwind.config.js`.

## 🌐 API

Por defecto, las peticiones se realizan a `/api/v1`. Podés configurar la URL en `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```
