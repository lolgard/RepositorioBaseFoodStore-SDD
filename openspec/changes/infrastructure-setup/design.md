## Context

Food Store es un sistema de e-commerce para venta de productos alimenticios. El proyecto requiere un scaffolding inicial que establezca las bases para el desarrollo de 19 changes posteriores. Actualmente no existe una estructura definida de monorepo, ni configuración de backend/frontend, ni patrones base de arquitectura.

El stack tecnológico definido es:
- **Backend**: FastAPI (Python, ASGI) + SQLModel (ORM) + Alembic (migraciones) + Pydantic v2 (validación) + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Zustand (estado cliente) + TanStack Query (estado servidor) + Tailwind CSS + Axios
- **Testing**: Pytest (backend) + herramientas de testing para React

## Goals / Non-Goals

**Goals:**
- Establecer estructura de monorepo con carpetas `backend/` y `frontend/`
- Configurar FastAPI con middleware CORS, manejo de errores RFC 7807, y dependencias asíncronas
- Implementar SQLModel como ORM con integración de Alembic para migraciones automáticas
- Crear patrones base: `BaseRepository[T]` genérico y `UnitOfWork` como context manager asíncrono
- Configurar React + Vite + TypeScript con Tailwind CSS integrado
- Implementar Zustand para gestión de estado del cliente (auth, cart) con persistencia en localStorage
- Configurar TanStack Query para gestión de estado del servidor con Axios
- Establecer interceptores de Axios para manejo automático de JWT y renovación de tokens
- Configurar Pydantic v2 con esquemas de Request/Response y validación de inputs
- Setup de testing con pytest y configuración de base de datos PostgreSQL para desarrollo

**Non-Goals:**
- No implementar lógica de negocio específica (usuarios, productos, pedidos, etc.)
- No crear modelos SQLModel específicos más allá de una base abstracta
- No implementar autenticación completa (solo estructura base para JWT)
- No crear componentes React específicos (solo estructura y configuración)

## Decisions

### 1. Estructura de Monorepo
**Decisión**: Usar carpetas `backend/` y `frontend/` en la raíz del proyecto.
**Rationale**: Separación clara de responsabilidades. Backend independiente con su propio entorno Python (virtual env o Poetry). Frontend independiente con su propio package.json y configuración Vite.
**Alternativas consideradas**:
- Monorepo con Turborepo/Nx: Demasiado complejo para este proyecto
- Todo en un solo proyecto: Mezcla tecnologías y dificulta despliegue independiente

### 2. ORM: SQLModel sobre SQLAlchemy directo
**Decisión**: Usar SQLModel para definir modelos que sirvan tanto para ORM como para validación Pydantic.
**Rationale**: SQLModel unifica SQLAlchemy (base de datos) y Pydantic (validación de API). Los modelos definidos sirven para: (1) tablas de base de datos, (2) esquemas de request Pydantic, (3) esquemas de response Pydantic. Esto reduce duplicación de código significativamente.
**Alternativas consideradas**:
- SQLAlchemy + Pydantic separados: Requiere duplicar definiciones de campos
- Solo Pydantic: No tiene capacidades ORM para PostgreSQL

### 3. Patrón Unit of Work con Context Manager asíncrono
**Decisión**: Implementar `UnitOfWork` que extienda `asynccontextmanager` y gestione una sesión de SQLModel/SQLAlchemy.
**Rationale**: El Unit of Work (UoW) garantiza atomicidad en operaciones que involucran múltiples repositorios. Al usar context manager asíncrono (`async with`), se asegura que la sesión se cierre correctamente y se ejecute rollback en caso de excepción. Esto es crítico para operaciones como crear un pedido con sus detalles, actualizar stock y registrar historial.
**Alternativas consideradas**:
- Manejo manual de sesiones: Propenso a errores de "session leak" y transacciones olvidadas
- Repositorios con sesión propia: No garantiza atomicidad entre múltiples repositorios

### 4. BaseRepository[T] Genérico
**Decisión**: Crear una clase genérica `BaseRepository[T]` parametrizada con el tipo de modelo SQLModel.
**Rationale**: Evita duplicar operaciones CRUD comunes (get_by_id, list_all, create, update, delete) en cada repositorio específico. La genéricidad permite que `BaseRepository[Usuario]` y `BaseRepository[Producto]` reutilicen la misma lógica.
**Alternativas consideradas**:
- Cada repositorio implementa sus propios métodos: Duplicación innecesaria
- Funciones sueltas por operación: No sigue el patrón de orientación a objetos para repositorios

### 5. Manejo de Errores RFC 7807
**Decisión**: Implementar un Exception Handler global en FastAPI que devuelva errores en formato RFC 7807 (Problem Details for HTTP APIs).
**Rationale**: Estandariza las respuestas de error en toda la API. Los clientes pueden parsear un formato consistente con campos `type`, `title`, `status`, `detail`, `instance`. Esto facilita el manejo de errores en el frontend con Axios interceptors.
**Alternativas consideradas**:
- Respuestas de error ad-hoc por endpoint: Inconsistente y difícil de mantener
- Usar solo HTTP status codes: Falta contexto para el cliente

### 6. Estado Frontend: Zustand (cliente) vs TanStack Query (servidor)
**Decisión**: Separación estricta: Zustand para estado del cliente (auth, cart, UI) y TanStack Query para estado del servidor (productos, pedidos, usuarios).
**Rationale**: Mezclar ambos tipos de estado en un solo store (como Redux) lleva a problemas de sincronización y duplicación. Zustand es minimalista y performante para estado que vive en el cliente. TanStack Query maneja automáticamente caching, revalidación y estados de carga para datos del servidor.
**Alternativas consideradas**:
- Solo Zustand con fetching manual: Pierde las ventajas de TanStack Query (caching, deduplicación)
- Solo TanStack Query: No tiene un lugar natural para estado puramente del cliente

### 7. Axios con Interceptors para JWT
**Decisión**: Configurar una instancia de Axios con interceptores que: (1) adjunten el access token al header Authorization, (2) manejen respuestas 401 renovando el token transparentemente.
**Rationale**: Evita que cada llamada a la API tenga que manejar manualmente el token. La renovación transparente mejora la experiencia del usuario: si el access token expira, el interceptor automáticamente usa el refresh token, obtiene nuevos tokens, y reintenta la petición original sin que el usuario lo note.
**Alternativas consideradas**:
- Fetch API nativo: Requiere envolver cada llamada con lógica de token
- Sin interceptores: Código repetitivo en cada servicio de API

## Risks / Trade-offs

**[Risk]**: La configuración inicial de SQLModel + Alembic puede ser compleja → **Mitigation**: Seguir la documentación oficial de FastAPI + SQLModel. Usar `sqlmodel-cli` para generar migraciones automáticamente.

**[Risk]**: El patrón Unit of Work asíncrono puede ser confuso para desarrolladores nuevos → **Mitigation**: Documentar claramente el uso con comentarios en el código y ejemplos de `async with`.

**[Risk]**: Separar estado en Zustand y TanStack Query requiere disciplina → **Mitigation**: Establecer reglas claras en la arquitectura del frontend (Feature-Sliced Design) sobre qué va en cada uno.

**[Risk]**: Configuración de Vite + Tailwind + TypeScript puede tener conflictos de versiones → **Mitigation**: Usar versiones LTS y seguir la guía de `react-vite-best-practices` instalada como skill.

**[Risk]**: Las migraciones de Alembic pueden desincronizarse con los modelos SQLModel → **Mitigation**: Ejecutar `alembic revision --autogenerate` después de cada cambio en los modelos y revisar los scripts generados antes de aplicarlos.

## Migration Plan

1. **Backend Setup**:
   - Crear carpeta `backend/` con `pyproject.toml` (usando Poetry o pip)
   - Instalar dependencias: fastapi, uvicorn[standard], sqlmodel, alembic, pydantic-settings, python-jose[cryptography], passlib[bcrypt], python-multipart
   - Configurar `alembic.ini` y carpeta `alembic/versions/`
   - Crear estructura: `app/routers/`, `app/services/`, `app/repositories/`, `app/models/`, `app/schemas/`
   - Implementar `app/core/config.py` (variables de entorno con Pydantic Settings)
   - Implementar `app/core/database.py` (sesión SQLModel, engine, UnitOfWork)
   - Implementar `app/core/exceptions.py` (RFC 7807)
   - Implementar `app/repositories/base_repository.py` (BaseRepository[T])
   - Crear `main.py` con la app FastAPI, middleware CORS, y exception handlers

2. **Frontend Setup**:
   - Ejecutar `npm create vite@latest frontend -- --template react-ts`
   - Instalar dependencias: zustand, @tanstack/react-query, axios, tailwindcss, postcss, autoprefixer
   - Configurar Tailwind (crear `tailwind.config.js` y `postcss.config.js`, agregar directivas en `index.css`)
   - Crear estructura siguiendo Feature-Sliced Design: `src/app/`, `src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`
   - Implementar `src/shared/api/axios-instance.ts` (instancia de Axios con interceptores)
   - Implementar `src/shared/store/auth-store.ts` (Zustand con persistencia)
   - Configurar `src/app/providers.tsx` (TanStack Query Provider)

3. **Testing Setup**:
   - Backend: Configurar `pytest.ini`, crear `tests/` con conexión a base de datos de testing
   - Frontend: Configurar Vitest o Jest (según preferencia del equipo)

4. **Variables de Entorno**:
   - Crear `.env.example` con las variables necesarias (DATABASE_URL, SECRET_KEY, etc.)
   - Documentar en README.md

## Open Questions

- ¿Usar Poetry o pip + venv para gestión de dependencias de Python? (Recomendado: Poetry por su manejo de lockfile)
- ¿Dónde alojar el código fuente del backend? (Recomendado: `backend/app/` siguiendo estructura de FastAPI)
- ¿Versión específica de Node.js para el frontend? (Recomendado: Node.js 18+ para compatibilidad con Vite)
- ¿Usar npm, yarn, o pnpm para el frontend? (Recomendado: npm por simplicidad, o pnpm por eficiencia de disco)
