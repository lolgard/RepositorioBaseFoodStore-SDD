## 1. Backend Structure Setup

- [x] 1.1 Create `backend/` directory with `app/` subdirectory
- [x] 1.2 Create `pyproject.toml` with FastAPI, sqlmodel, alembic, pydantic-settings, python-jose, passlib[bcrypt], python-multipart dependencies
- [x] 1.3 Create `alembic.ini` configuration file pointing to DATABASE_URL
- [x] 1.4 Create `backend/alembic/versions/` directory for migration scripts
- [x] 1.5 Create `backend/app/routers/`, `backend/app/services/`, `backend/app/repositories/`, `backend/app/models/`, `backend/app/schemas/` directories

## 2. Backend Core Implementation

- [x] 2.1 Create `backend/app/core/config.py` with Pydantic Settings for environment variables (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS)
- [x] 2.2 Create `backend/app/core/database.py` with SQLModel engine creation, session maker, and async session dependency
- [x] 2.3 Create `backend/app/core/exceptions.py` with custom exception classes and RFC 7807 Problem Detail model
- [x] 2.4 Register global exception handler in `main.py` to return RFC 7807 formatted error responses
- [x] 2.5 Create `backend/app/repositories/base_repository.py` with generic `BaseRepository[T]` class implementing: get_by_id, list_all, count, create, update, soft_delete methods
- [x] 2.6 Create `backend/app/repositories/unit_of_work.py` with `UnitOfWork` async context manager exposing repositories as attributes

## 3. FastAPI Application Setup

- [x] 3.1 Create `backend/main.py` with FastAPI instance (title="Food Store API", version="1.0.0")
- [x] 3.2 Configure CORS middleware with allowed origins from environment variable
- [x] 3.3 Add RFC 7807 exception handler for unhandled exceptions (HTTP 500)
- [x] 3.4 Add exception handlers for common HTTP errors (404, 401, 403, 422)
- [x] 3.5 Create `backend/app/schemas/` base schemas: `BaseSchema`, `CreateSchema`, `UpdateSchema`, `ReadSchema` with proper Pydantic v2 field validators
- [x] 3.6 Create `.env.example` file documenting all required environment variables

## 4. Frontend Structure Setup

- [x] 4.1 Create frontend project using `npm create vite@latest frontend -- --template react-ts`
- [x] 4.2 Install dependencies: zustand, @tanstack/react-query, axios, tailwindcss, postcss, autoprefixer, react-router-dom
- [x] 4.3 Initialize Tailwind CSS: create `tailwind.config.js` and `postcss.config.js`, add directives to `src/index.css`
- [x] 4.4 Create Feature-Sliced Design structure: `src/app/`, `src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`

## 5. Frontend Core Implementation

- [x] 5.1 Create `src/shared/api/axios-instance.ts` with Axios instance, request interceptor (attach JWT), response interceptor (handle 401 with token refresh)
- [x] 5.2 Create `src/shared/store/auth-store.ts` with Zustand store for auth state (user, tokens) with localStorage persistence middleware
- [x] 5.3 Create `src/app/providers.tsx` wrapping app with `QueryClientProvider` and React Router
- [x] 5.4 Configure `src/app/router.tsx` with public routes (`/login`, `/register`) and placeholder protected route structure
- [x] 5.5 Create base layout component with navigation placeholder in `src/widgets/layout/`

## 6. Testing Setup

- [x] 6.1 Backend: Create `pytest.ini` with async settings, create `backend/tests/` directory with conftest.py providing test database session
- [x] 6.2 Backend: Create a sample test file `backend/tests/test_health.py` to verify FastAPI app starts
- [x] 6.3 Frontend: Configure Vitest or Jest (as per team preference) with TypeScript support
- [x] 6.4 Frontend: Create a sample test to verify Vite + React + TypeScript setup works

## 7. Documentation and Final Checks

- [x] 7.1 Create root `README.md` with project overview, tech stack, and setup instructions for backend and frontend
- [x] 7.2 Create `backend/README.md` with FastAPI setup, how to run, and how to generate Alembic migrations
- [x] 7.3 Create `frontend/README.md` with Vite setup, available scripts, and Tailwind/css instructions
- [x] 7.4 Verify backend starts: `cd backend && uvicorn app.main:app --reload`
- [x] 7.5 Verify frontend starts: `cd frontend && npm run dev`
- [x] 7.6 Run `alembic revision --autogenerate -m "initial"` to verify Alembic can detect SQLModel changes (even if no models exist yet)
