# Food Store

Sistema de e-commerce para venta de productos alimenticios.

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python ASGI) + **SQLModel** (ORM) + **Alembic** (migraciones)
- **Pydantic v2** (validación)
- **PostgreSQL** (base de datos)
- **JWT** (autenticación con access + refresh tokens)
- **slowapi** (rate limiting)

### Frontend
- **React** + **TypeScript** + **Vite**
- **Zustand** (estado del cliente)
- **TanStack Query** (estado del servidor)
- **Tailwind CSS** (estilos)
- **Axios** (peticiones HTTP)

## 📂 Estructura del Proyecto

```
food-store/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── core/         # Config, database, exceptions
│   │   ├── models/       # SQLModel models
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   ├── repositories/  # BaseRepository[T], UnitOfWork
│   │   ├── services/      # Business logic
│   │   ├── routers/      # API endpoints
│   │   └── main.py       # FastAPI app
│   ├── alembic/
│   ├── tests/
│   ├── pyproject.toml
│   └── alembic.ini
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── app/         # Providers (QueryClient, Router)
│   │   ├── pages/       # Page components
│   │   ├── widgets/     # Layout, shared widgets
│   │   ├── features/    # Feature components
│   │   ├── entities/    # Domain models
│   │   └── shared/      # API, stores, utilities
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                 # Documentación
└── openspec/             # OPSX workflow artifacts
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -e .
cp .env.example .env
# Edit .env with your database URL
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📋 OPSX Workflow

Este proyecto usa **OPSX** (Spec-Driven Development):

1. `openspec new change "<name>"` - Crear change
2. `openspec propose` - Generar proposal, design, specs, tasks
3. `openspec apply` - Implementar tasks
4. `openspec archive` - Archivar change completado

**Changes planificados:** 19 changes (ver `docs/CHANGES.md`)

## ✅ Change Actual: `infrastructure-setup`

- **Status:** En progreso (36/36 tasks completadas)
- **Descripción:** Scaffolding inicial del monorepo, configuración base de backend/frontend, patrones base.

## 🤝 Team

Food Store Development Team
