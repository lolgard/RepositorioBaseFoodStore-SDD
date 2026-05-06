# Food Store Backend

API backend para la plataforma de e-commerce de alimentos, construida con **FastAPI** y **SQLModel**.

## 🚀 Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **SQLModel** - ORM moderno basado en SQLAlchemy y Pydantic
- **PostgreSQL** - Base de datos principal
- **Alembic** - Migraciones de base de datos
- **Pydantic Settings** - Gestión de configuración

## 📋 Prerrequisitos

- Python >= 3.10
- PostgreSQL
- (Opcional) Entorno virtual: `python -m venv venv`

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   pip install -e ".[dev]"
   ```

3. **Configurar variables de entorno**
   
   Copiar `.env.example` a `.env` y ajustar:
   ```bash
   cp .env.example .env
   ```
   
   Variables importantes:
   - `DATABASE_URL` - URL de conexión a PostgreSQL
   - `SECRET_KEY` - Clave secreta para JWT
   - `ACCESS_TOKEN_EXPIRE_MINUTES` - Expiración de access token (default: 30)
   - `REFRESH_TOKEN_EXPIRE_DAYS` - Expiración de refresh token (default: 7)

4. **Ejecutar migraciones**
   ```bash
   alembic upgrade head
   ```

5. **Iniciar el servidor**
   ```bash
   uvicorn app.main:app --reload
   ```

   La API estará disponible en `http://localhost:8000`
   
   - Docs (Swagger): `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## 🧪 Tests

Ejecutar tests con pytest:
```bash
pytest
```

Para tests con coverage:
```bash
pytest --cov=app --cov-report=html
```

## 📦 Estructura del Proyecto

```
backend/
├── app/
│   ├── core/          # Configuración, database, excepciones
│   ├── models/        # Modelos SQLModel
│   ├── schemas/       # Esquemas Pydantic
│   ├── routers/       # Endpoints de la API
│   ├── services/      # Lógica de negocio
│   ├── repositories/   # Acceso a datos
│   └── main.py       # Punto de entrada FastAPI
├── alembic/          # Migraciones
├── tests/            # Tests con pytest
├── pyproject.toml    # Configuración del proyecto
└── alembic.ini       # Configuración de Alembic
```

## 🔄 Migraciones con Alembic

Generar una nueva migración:
```bash
alembic revision --autogenerate -m "descripción del cambio"
```

Aplicar migraciones pendientes:
```bash
alembic upgrade head
```

Revertir última migración:
```bash
alembic downgrade -1
```

## 📝 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/refresh` - Refresh token

### Usuarios
- `GET /api/v1/users/me` - Obtener perfil actual
- `PUT /api/v1/users/me` - Actualizar perfil

### Productos
- `GET /api/v1/products` - Listar productos
- `GET /api/v1/products/{id}` - Obtener producto
- `POST /api/v1/products` - Crear producto (admin)
- `PUT /api/v1/products/{id}` - Actualizar producto (admin)
- `DELETE /api/v1/products/{id}` - Eliminar producto (admin)

## 🔒 Autenticación

La API usa **JWT (JSON Web Tokens)** con:
- Access tokens de corta duración (30 min default)
- Refresh tokens de larga duración (7 días default)

Incluir el token en el header:
```
Authorization: Bearer <access_token>
```

## 📄 Licencia

MIT
