# Specification: Client Profile

## Scope
Permitir a usuarios autenticados gestionar su perfil y contraseña.

## API Endpoints

### `GET /api/v1/auth/me`
- Ya implementado. Devuelve `UserResponse`.
- Sin cambios.

### `PUT /api/v1/auth/me`
- Autenticación: Requerida (Bearer token).
- Request body (todos opcionales):
  ```json
  {
    "first_name": "string (1-100 chars)",
    "last_name": "string (1-100 chars)",
    "phone": "string (max 20 chars) | null"
  }
  ```
- Response: `UserResponse` actualizado.
- Status: 200 OK.
- Errors: 401 (no autenticado), 422 (validación).

### `PUT /api/v1/auth/me/password`
- Autenticación: Requerida (Bearer token).
- Request body:
  ```json
  {
    "current_password": "string",
    "new_password": "string (min 8 chars, max 128 chars)"
  }
  ```
- Response:
  ```json
  {
    "message": "Password changed successfully. All other sessions have been logged out."
  }
  ```
- Side effect: Revoca TODOS los refresh tokens del usuario (fuerza re-login en otras sesiones).
- Status: 200 OK.
- Errors:
  - 400: New password matches current password.
  - 401: Current password is incorrect.
  - 422: New password too short/long.
  - 401: No autenticado.

## Frontend

### `/profile` page
- **Profile Info section**:
  - Email: solo lectura.
  - First Name: input editable.
  - Last Name: input editable.
  - Phone: input editable (o vacío).
  - Botón "Save Changes".
  - Loading state mientras se guarda.
  - Success/error feedback.
- **Change Password section**:
  - Current Password: input password.
  - New Password: input password.
  - Confirm New Password: input password.
  - Botón "Change Password".
  - Validación client-side: new_password === confirm_new_password.
  - Loading state.
  - Success/error feedback.

## Security
- El cambio de contraseña invalida TODOS los refresh tokens activos excepto el actual (el cliente recibe un nuevo token de acceso pero debe re-autenticarse al cerrar sesión).
