## Context

Food Store necesita un sistema de autenticación y autorización como base para personalizar la experiencia del cliente y restringir operaciones administrativas. El backend ya cuenta con BaseRepository[T], UnitOfWork, manejo de errores RFC 7807, y configuración async de base de datos con PostgreSQL en Render. El frontend ya tiene Zustand con persistencia, Axios interceptors, TanStack Query y estructura FSD.

Este diseño cubre el cambio `auth-system` (change #2 del plan) que implementa registro, login con JWT, refresh token con rotación, logout, y RBAC con 4 roles.

## Goals / Non-Goals

**Goals:**
- Registro de nuevos clientes con validación de datos (email, password, datos personales)
- Login con JWT: access token (corta duración) + refresh token (larga duración)
- Refresh de token con rotación: cada refresh invalida el refresh token anterior
- Logout con invalidación explícita del refresh token
- RBAC con 4 roles: Cliente, Staff, Gestor (Gerente), Admin
- Protección de rutas de API por rol mediante dependencias FastAPI
- Rate limiting en endpoints de login/registro (5 intentos / 15 min)
- Seed de base de datos: crear rol Admin y usuario admin por defecto
- Frontend: páginas Login/Register, store de auth, integración con interceptors

**Non-Goals:**
- Reset de contraseña / "olvidé mi contraseña" (será en change `client-profile`)
- OAuth2 social login (Google, GitHub, etc.)
- 2FA / MFA
- Session management del lado del servidor (puro JWT stateless)
- Bloqueo de cuenta por intentos fallidos

## Decisions

### 1. JWT con access token (15 min) + refresh token (7 días) con rotación
- **Decisión**: Access token corto (15 min), refresh token largo (7 días). Cada refresh invalida el refresh anterior y emite uno nuevo.
- **Por qué**: Access token corto minimiza el riesgo si es robado. Refresh token con rotación previene replay attacks: si un refresh token es usado dos veces, ambos son invalidados (detecta robo).
- **Alternativa considerada**: Refresh token sin rotación → más simple pero menos seguro.
- **Store de refresh tokens**: Tabla `refresh_tokens` en PostgreSQL (no cookies) para poder invalidar tokens activos desde el backend.

### 2. RBAC con 4 roles en tabla `roles` + relación `user_roles`
- **Decisión**: Roles definidos en tabla `roles` con nombre y descripción. Asignación many-to-many via `user_roles` (un usuario puede tener múltiples roles).
- **Por qué**: Tabla de roles permite consultas eficientes y escalar a más roles en el futuro. Relación many-to-many permite que un usuario sea, ej., Admin y Gestor simultáneamente.
- **Alternativa considerada**: Enum en columna `role` del usuario → más simple pero no escala a múltiples roles. Usaremos esta alternativa simplificada inicialmente (columna `role` con Enum) porque el negocio no requiere múltiples roles por usuario. Migrar a many-to-many si surge la necesidad.

### 3. Password hashing con bcrypt via passlib
- **Decisión**: Usar `passlib[bcrypt]` para hashing de contraseñas (ya incluido en dependencias).
- **Por qué**: bcrypt es el estándar de la industria, incluye salt automático, es resistente a ataques de fuerza bruta por ser intencionalmente lento.

### 4. Rate limiting con slowapi
- **Decisión**: 5 intentos de login por IP cada 15 minutos. 3 intentos de registro por IP cada 60 minutos.
- **Por qué**: Previene ataques de fuerza bruta y registros masivos. slowapi ya está configurado como dependencia.
- **Almacenamiento**: En memoria (no requiere Redis para esta escala inicial).

### 5. Frontend: Zustand store con persistencia + Axios interceptor
- **Decisión**: El store de auth guarda tokens en localStorage via middleware `persist` de Zustand. El interceptor de Axios attacha el token automáticamente y maneja 401 con refresh.
- **Por qué**: Ya existe la estructura en `shared/store/auth-store.ts` y `shared/api/axios-instance.ts` del change anterior.

### 6. Seed de datos
- **Decisión**: Script `seed.py` que crea los 4 roles y un usuario admin por defecto (admin@foodstore.com).
- **Por qué**: Necesario para que el Staff/Gestor/Admin puedan operar desde el día 1.

## Risks / Trade-offs

- **Refresh token rotation complexity** → La lógica de detección de robo (refresh token reusado) agrega complejidad. Mitigación: implementar flag `is_used` en la tabla refresh_tokens.
- **Rate limiting en memoria** → No escala horizontalmente (múltiples instancias). Mitigación: para MVP es aceptable. Migrar a Redis cuando sea necesario.
- **Columna única `role` vs many-to-many** → Si el negocio requiere múltiples roles por usuario, habrá que migrar. Mitigación: decisión consciente, la migración es sencilla (nueva tabla + datos).
- **bcrypt en cada login** → Operación lenta intencionalmente. Para alta concurrencia, considerar aumentar el número de instancias.
- **Frontend store con tokens en localStorage** → Vulnerable a XSS. Mitigación: sanitización de inputs, CSP headers, y rotación de tokens limita daño.
