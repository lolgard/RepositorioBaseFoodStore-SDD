## Why

El sistema necesita autenticación y autorización para proteger recursos, identificar usuarios y controlar acceso según roles. Sin esto, no se puede personalizar la experiencia del cliente ni restringir operaciones administrativas. Es el cambio #2 planificado y depende directamente de `infrastructure-setup` (ya archivado).

## What Changes

- Registro de nuevos clientes con validación de datos
- Login con JWT (access token + refresh token)
- Refresh de token con rotación (el refresh token anterior se invalida)
- Logout con invalidación de refresh token
- Sistema de roles RBAC con 4 roles: Cliente, Staff, Gestor, Admin
- Protección de rutas de API por rol (dependencias en endpoints)
- Rate limiting en endpoints de login/registro usando slowapi
- Modelo de User en backend con SQLModel
- Esquemas Pydantic v2 para request/response de auth
- Store de auth en frontend con Zustand + persistencia
- Páginas de Login y Register en frontend
- Axios interceptors para attach JWT y refresh automático

## Capabilities

### New Capabilities
- `user-auth`: Registro de usuarios, login con JWT (access + refresh tokens), refreshtoken con rotación, logout con invalidación de tokens
- `role-management`: Definición de roles RBAC (Cliente, Staff, Gestor, Admin), protección de rutas por rol, seed de roles y admin inicial

### Modified Capabilities
<!-- No existing specs are modified. All specs are new. -->

## Impact

- **Backend**: Nuevo modelo `User` con SQLModel, nuevos endpoints en `backend/app/routers/auth.py`, nuevo servicio `backend/app/services/auth_service.py`, nuevo repositorio `backend/app/repositories/user_repository.py`, nuevos esquemas Pydantic en `backend/app/schemas/auth_schemas.py`
- **Frontend**: Páginas Login y Register, store de autenticación (Zustand + persist), actualización de Axios interceptors, componentes ProtectedRoute actualizados
- **Dependencias**: `python-jose` para JWT, `passlib[bcrypt]` para hashing (ya incluidas en pyproject.toml)
- **Base de datos**: Nueva tabla `users` con migración Alembic, seed de roles y admin inicial
