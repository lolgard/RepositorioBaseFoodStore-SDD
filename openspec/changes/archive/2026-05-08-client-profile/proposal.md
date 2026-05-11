# Change: client-profile

## What
Permitir a los usuarios autenticados visualizar y editar su perfil (nombre, apellido, teléfono), y cambiar su contraseña. El cambio de contraseña invalida **todos** los refresh tokens activos del usuario (medida de seguridad).

## Why
- **US-061**: Como cliente, quiero ver mi perfil para confirmar mis datos personales.
- **US-062**: Como cliente, quiero editar mi perfil para mantener mis datos actualizados.
- **US-063**: Como cliente, quiero cambiar mi contraseña por razones de seguridad, cerrando todas las demás sesiones activas.

## Dependencies
- `auth-system`: Ya implementa autenticación, `GET /me`, y `revoke_all_for_user`.
