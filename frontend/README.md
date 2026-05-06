# Food Store Frontend

Aplicación web para la plataforma de e-commerce de alimentos, construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS**.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **TanStack Query** - Data fetching y cache
- **Zustand** - State management ligero
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP

## 📋 Prerrequisitos

- Node.js >= 18
- npm o pnpm

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en `http://localhost:5173`

## 🧪 Tests

Ejecutar tests con Vitest:
```bash
npm run test
```

## 📦 Estructura del Proyecto (Feature-Sliced Design)

```
frontend/src/
├── app/                    # Configuración de la app
│   ├── providers.tsx      # Providers (QueryClient, Auth)
│   ├── router.tsx         # Configuración de rutas
│   └── ProtectedRoute.tsx # Rutas protegidas
├── pages/                 # Páginas de la aplicación
│   ├── login/
│   ├── register/
│   ├── home/
│   └── NotFoundPage.tsx
├── widgets/               # Componentes compuestos
│   └── layout/
├── features/              # Lógica de features
├── entities/              # Entidades de negocio
│   └── user/
├── shared/                # Código compartido
│   ├── api/
│   │   └── axios-instance.ts
│   └── store/
│       └── auth-store.ts
└── main.tsx              # Punto de entrada
```

## 📜 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run test` - Ejecuta tests
- `npm run lint` - Linter

## 🎨 Estilos

El proyecto usa **Tailwind CSS** para los estilos. Configurado en:
- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css` (directivas de Tailwind)

## 🔒 Autenticación

La aplicación maneja autenticación con:
- **Zustand** para estado global (`auth-store.ts`)
- **Axios interceptors** para manejo automático de tokens
- **Refresh token** automático en 401 responses

## 🌐 Conexión con Backend

La configuración de la API se hace en `src/shared/api/axios-instance.ts`:
- Base URL configurada via `VITE_API_URL`
- Interceptor de request: inyecta JWT en headers
- Interceptor de response: maneja 401 y refresca token

## 📄 Licencia

MIT
