# Tasks: client-profile

## Backend

- [x] 1. Backend: Agregar schema `ProfileUpdate` (first_name, last_name, phone opcionales)
- [x] 2. Backend: Agregar schema `PasswordChangeRequest` (current_password, new_password)
- [x] 3. Backend: Agregar schema `PasswordChangeResponse` (message)
- [x] 4. Backend: Agregar método `update_profile` en AuthService
- [x] 5. Backend: Agregar método `change_password` en AuthService (con revoke_all_for_user)
- [x] 6. Backend: Agregar endpoint `PUT /api/v1/auth/me`
- [x] 7. Backend: Agregar endpoint `PUT /api/v1/auth/me/password`
- [x] 8. Backend: Escribir tests de perfil (8 tests mínimos)
- [x] 9. Backend: Verificar que tests existentes no se rompen

## Frontend

- [x] 10. Frontend: Crear `shared/api/profile-api.ts` (getProfile, updateProfile, changePassword)
- [x] 11. Frontend: Crear `pages/profile/ProfilePage.tsx` (sección info + cambio password)
- [x] 12. Frontend: Agregar ruta `"/profile"` en `router.tsx`
- [x] 13. Frontend: Verificar TypeScript build (0 errores)

## Verification

- [x] 14. Verificar: Tests pasan (auth + profile)
- [x] 15. Verificar: TS build sin errores
- [x] 16. Archivar: mover a archive/YYYY-MM-DD-client-profile/
