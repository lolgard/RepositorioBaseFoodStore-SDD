# Design: delivery-addresses

## Backend

### Model (app/models/delivery_address.py)
- `DeliveryAddress`: id, user_id (FK), street, street_number, city, state, zip_code, country, is_default, additional_info, created_at, updated_at, deleted_at.
- Timestamps con `utcnow()`, soft delete.
- Máximo 5 direcciones por usuario (validación en servicio).
- Solo una dirección predeterminada por usuario.

### Migration
- Nueva migración Alembic: `add_delivery_address_table`.

### Schemas (app/schemas/delivery_address.py)
- `AddressCreate`: street, street_number, city, state, zip_code, country (default "Argentina"), additional_info (optional).
- `AddressUpdate`: mismos campos, todos opcionales.
- `AddressResponse`: id, user_id, todos los campos, is_default, created_at, updated_at.

### Repository (app/repositories/delivery_address_repository.py)
- CRUD base + `get_by_user(user_id)`, `get_by_user_and_id(user_id, address_id)`, `count_by_user(user_id)`, `unset_default_for_user(user_id)`.

### Service (app/services/delivery_address_service.py)
- `create_address(user_id, data)`: verifica límite de 5, si es la primera la marca default, si `is_default=True` desmarca las demás.
- `list_addresses(user_id)`: retorna ordenado por default primero, luego por updated_at DESC.
- `get_address(user_id, address_id)`: con ownership check.
- `update_address(user_id, address_id, data)`: con ownership check.
- `delete_address(user_id, address_id)`: soft delete con ownership check.
- `set_default(user_id, address_id)`: desmarca todas, marca la especificada.

### Router (app/routers/delivery_addresses.py)
- `GET /api/v1/addresses` → listar direcciones del usuario autenticado
- `POST /api/v1/addresses` → crear dirección
- `GET /api/v1/addresses/{id}` → obtener dirección
- `PUT /api/v1/addresses/{id}` → actualizar dirección
- `DELETE /api/v1/addresses/{id}` → eliminar dirección
- `PUT /api/v1/addresses/{id}/default` → marcar como predeterminada

Todos protegidos con `get_current_user_id`.

### Tests (backend/tests/test_delivery_addresses.py)
- Mínimo 12 tests: CRUD, límite 5, default switching, ownership, auth.

## Frontend

### Types (entities/address/types.ts)
- `Address`: interfaz mirror de AddressResponse.
- `AddressCreate`, `AddressUpdate`: para formularios.

### API client (shared/api/address-api.ts)
- `listAddresses()`, `createAddress(data)`, `getAddress(id)`, `updateAddress(id, data)`, `deleteAddress(id)`, `setDefault(id)`.

### Pages
- `pages/addresses/AddressListPage.tsx`: lista de direcciones con íconos, badge "Default", botones editar/eliminar/marcar default.
- `pages/addresses/AddressFormPage.tsx`: formulario reutilizable para crear/editar.

### Router (app/router.tsx)
- `/addresses` → AddressListPage (CLIENTE)
- `/addresses/new` → AddressFormPage (CLIENTE)
- `/addresses/:id/edit` → AddressFormPage (CLIENTE)

### Navigation (shared/config/navigation.ts)
- Agregar item "Addresses" para CLIENTE.
