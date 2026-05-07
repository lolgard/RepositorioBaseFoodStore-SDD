# Food Store — Backend API

API REST construida con **FastAPI** + **SQLModel** + **PostgreSQL**.

## 🛠️ Tech Stack

- **FastAPI** - Framework ASGI
- **SQLModel** - ORM con Pydantic v2
- **Alembic** - Migraciones de base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con access + refresh tokens
- **slowapi** - Rate limiting
- **Pydantic v2** - Validación de datos
- **Pytest** - Tests

## 📁 Estructura

```
backend/
├── app/
│   ├── core/           # Config, database, exceptions
│   ├── models/         # SQLModel models
│   ├── schemas/        # Pydantic v2 schemas
│   ├── repositories/   # BaseRepository[T], UnitOfWork
│   ├── services/       # Business logic
│   ├── routers/        # API endpoints
│   └── main.py         # FastAPI app entry point
├── alembic/            # Migrations
│   └── versions/       # Migration scripts
├── tests/              # Test suite
├── pyproject.toml      # Project config & dependencies
└── alembic.ini         # Alembic configuration
```

## 🚀 Setup

```bash
# Crear entorno virtual
python -m venv venv
source venv/Scripts/activate  # Windows

# Instalar dependencias
pip install -e .
pip install -e ".[dev]"      # Incluye dev dependencies

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu conexión a PostgreSQL

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

## 🧪 Tests

```bash
cd backend
pip install -e ".[dev]"
pytest -v
```

## 📋 Migraciones

```bash
# Crear nueva migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

## 🔗 API Endpoints

La API corre en `http://localhost:8000`.

- **Docs**: `http://localhost:8000/docs`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`
- **Health Check**: `GET /api/v1/health`
