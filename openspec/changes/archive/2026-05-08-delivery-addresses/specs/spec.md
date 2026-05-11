# Specification: Delivery Addresses

## API

### Model
```
DeliveryAddress:
  id: int (PK, autoincrement)
  user_id: int (FK -> users.id, NOT NULL)
  street: str (1-200)
  street_number: str (1-20)
  city: str (1-100)
  state: str (1-100)
  zip_code: str (1-20)
  country: str (1-100, default "Argentina")
  is_default: bool (default False)
  additional_info: str | None (max 200)
  created_at: datetime
  updated_at: datetime
  deleted_at: datetime | None
```

### Endpoints (prefix: /api/v1/addresses)

All endpoints require authentication (Bearer token). Ownership enforced server-side.

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | / | List user's addresses (default first) | 200 |
| POST | / | Create address (max 5 per user) | 201 |
| GET | /{id} | Get address detail | 200 |
| PUT | /{id} | Update address | 200 |
| DELETE | /{id} | Soft delete address | 200 |
| PUT | /{id}/default | Set as default | 200 |

### Errors
- 400: Max 5 addresses reached
- 404: Address not found (or doesn't belong to user)
- 401: Not authenticated

## Frontend

### /addresses page
- Lista de direcciones del usuario autenticado
- Cada tarjeta muestra: calle, número, ciudad, provincia, CP, país
- Badge "Default" en la dirección predeterminada
- Botones: "Set as default", "Edit", "Delete"
- Botón "Add Address" que navega a /addresses/new

### /addresses/new page
- Formulario con campos: street, street_number, city, state, zip_code, country (default Argentina), additional_info
- Checkbox "Set as default"
- Botón "Save", link "Cancel"

### /addresses/:id/edit page
- Mismo formulario precargado con datos existentes
- Botón "Save", link "Cancel"
