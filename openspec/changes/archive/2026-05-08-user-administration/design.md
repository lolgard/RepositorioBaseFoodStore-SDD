# Design: user-administration

## Backend

### Endpoints (routers/users.py)
- `GET /api/v1/users` → listar usuarios (ADMIN, con filtros)
- `GET /api/v1/users/{id}` → detalle usuario
- `PUT /api/v1/users/{id}` → actualizar datos/roles
- `DELETE /api/v1/users/{id}` → soft delete (desactivar)

### Servicio
- Validar que no se pueda desactivar a sí mismo
- Solo ADMIN puede cambiar roles

## Frontend

### Pages
- `pages/users/UserListPage.tsx`: tabla con todos los usuarios, botón editar/desactivar
- `pages/users/UserFormPage.tsx`: editar usuario (nombre, email, rol), desactivar

### Router
- `/users` → UserListPage (ADMIN)
- `/users/{id}/edit` → UserFormPage (ADMIN)

### Navigation
- Ya existe "Users" para ADMIN en navigation.ts
