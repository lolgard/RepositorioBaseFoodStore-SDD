# Design: client-profile

## Backend

### Schemas (app/schemas/auth.py)
- `ProfileUpdate`: campos opcionales `first_name`, `last_name`, `phone`.
- `PasswordChangeRequest`: `current_password` (str), `new_password` (str, min_length=8).
- `PasswordChangeResponse`: `message` (str).

### Service (app/services/auth_service.py)
- `update_profile(user_id, data)` → User
  - Usa `user_repo.update()` con solo los campos enviados.
- `change_password(user_id, data)` → None
  - Verifica `_verify_password(data.current_password, user.password_hash)`.
  - Si no coincide → `UnauthorizedError("Current password is incorrect")`.
  - Hashea `data.new_password` y actualiza.
  - Llama a `refresh_token_repo.revoke_all_for_user(user_id)` para invalidar TODAS las sesiones.

### Router (app/routers/auth.py)
- `PUT /api/v1/auth/me` → ProfileUpdate → UserResponse
- `PUT /api/v1/auth/me/password` → PasswordChangeRequest → PasswordChangeResponse

Ambos protegidos con `get_current_user_id`.

### Tests (backend/tests/test_profile.py)
- `test_get_profile` — GET /me devuelve datos correctos.
- `test_update_profile` — PUT /me cambia nombre/teléfono.
- `test_update_profile_empty_body` — PUT /me sin cambios no rompe.
- `test_change_password_success` — PUT /me/password funciona y emite nuevo token.
- `test_change_password_wrong_current` — PUT /me/password con contraseña incorrecta da 401.
- `test_change_password_weak_new` — PUT /me/password con new_password débil da 422.
- `test_profile_unauthenticated` — Sin token da 401.
- `test_change_password_logs_out_other_sessions` — Cambiar password invalida otros refresh tokens.

## Frontend

### Pages
- `pages/profile/ProfilePage.tsx`: Página único con dos secciones:
  1. **Profile Info**: muestra email (solo lectura), first_name, last_name, phone (editables). Botón "Save".
  2. **Change Password**: formulario con current_password, new_password, confirm_new_password. Botón "Change Password".

### Router (app/router.tsx)
- Ruta `"/profile"` → ProfilePage (protegida, cualquier rol autenticado).

La navegación ya tiene el item "Profile" en `shared/config/navigation.ts`.

### API client
No se necesita un archivo nuevo; se agregan métodos al `auth-api.ts` existente o se crea `profile-api.ts`.

## Migration
No se requiere migración. El modelo `User` ya tiene `first_name`, `last_name`, `phone`, `password_hash`.
Solo se agregan lógica de negocio y endpoints.
