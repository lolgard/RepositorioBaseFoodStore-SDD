## 1. Backend — Modelos y DB

- [x] 1.1 Crear modelo SQLModel `User` con campos: id, email, first_name, last_name, phone, password_hash, role (Enum: CLIENTE, STAFF, GESTOR, ADMIN), is_active, created_at, updated_at, deleted_at (soft delete)
- [x] 1.2 Crear modelo SQLModel `RefreshToken` con campos: id, token_hash, user_id (FK), expires_at, is_revoked, created_at
- [x] 1.3 Crear esquemas Pydantic v2: `UserCreate`, `UserResponse`, `UserLogin`, `TokenResponse`, `RefreshRequest`, `RegisterResponse`
- [x] 1.4 Generar migración Alembic para tablas `users` y `refresh_tokens`
- [x] 1.5 Crear script `backend/seed.py` para seed de roles y admin inicial (admin@foodstore.com)

## 2. Backend — Repositorio y Servicios

- [x] 2.1 Crear `UserRepository` con métodos: get_by_email, get_by_id, create, list_all (hereda de BaseRepository)
- [x] 2.2 Crear `RefreshTokenRepository` con métodos: create, find_by_token, revoke, revoke_all_for_user
- [x] 2.3 Crear `AuthService` con métodos: register, login, refresh_token, logout, get_current_user
- [x] 2.4 Implementar hashing de contraseñas con passlib[bcrypt] en AuthService
- [x] 2.5 Implementar creación y validación de JWT (access + refresh) con python-jose
- [x] 2.6 Implementar lógica de refresh token rotation con detección de reuse (theft detection)

## 3. Backend — Endpoints y Rutas

- [x] 3.1 Crear `POST /api/v1/auth/register` — registro de nuevo cliente
- [x] 3.2 Crear `POST /api/v1/auth/login` — login con email y password
- [x] 3.3 Crear `POST /api/v1/auth/refresh` — refresh de token con rotación
- [x] 3.4 Crear `POST /api/v1/auth/logout` — logout con invalidación de refresh token
- [x] 3.5 Crear `GET /api/v1/auth/me` — obtener usuario autenticado
- [x] 3.6 Implementar dependencias FastAPI: `get_current_user`, `require_role(role)` para proteger rutas por rol
- [x] 3.7 Configurar rate limiting con slowapi en endpoints de login (5/15min) y register (3/60min)
- [x] 3.8 Registrar auth router en `main.py`

## 4. Backend — Tests

- [x] 4.1 Test de registro exitoso y validaciones (email duplicado, password débil, email inválido)
- [x] 4.2 Test de login exitoso y credenciales inválidas
- [x] 4.3 Test de refresh token (éxito, reuse detection, token expirado)
- [x] 4.4 Test de logout y endpoints protegidos (auth requerida, rol insuficiente)

## 5. Frontend — Store y API

- [x] 5.1 Actualizar `auth-store.ts` con acciones: login, register, logout (async), setUser
- [x] 5.2 axios-instance.ts ya existente con interceptor JWT y auto-refresh en 401
- [x] 5.3 Crear `src/shared/api/auth-api.ts` con funciones: login, register, refresh, logout, getMe

## 6. Frontend — Páginas y Componentes

- [x] 6.1 LoginPage con formulario de email + password (loading/error/redirect)
- [x] 6.2 RegisterPage con formulario completo (nombre, apellido, email, password, confirmación)
- [x] 6.3 AppLayout ya existente con user info, role, logout button
- [x] 6.4 ProtectedRoute ya existente con redirect a /login
- [x] 6.5 Router actualizado: rutas públicas sin layout, protegidas con AppLayout

## 7. Integración y Verificación

- [x] 7.1 Verificar que backend arranca sin errores y los endpoints de auth responden
- [x] 7.2 Verificar que frontend build pasa (tsc + vite build)
- [x] 7.3 Ejecutar tests completos (backend pytest — 13 tests pass)
- [x] 7.4 Ejecutar migraciones Alembic en la DB de Render
- [x] 7.5 Ejecutar seed de datos para crear admin inicial
