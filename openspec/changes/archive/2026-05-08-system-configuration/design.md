# Design: system-configuration

## Backend

### Model (app/models/system_config.py)
- id, key (unique), value (text), description, updated_at

### Endpoints (routers/system_config.py)
- `GET /api/v1/admin/config` → listar todas las configuraciones
- `PUT /api/v1/admin/config/{key}` → actualizar valor
- Solo ADMIN

## Frontend

### Pages
- `pages/admin/SystemConfigPage.tsx`: tabla key-value, inline edit

### Router
- `/admin/config` → SystemConfigPage (ADMIN)

### Navigation
- Agregar "System Config" para ADMIN
