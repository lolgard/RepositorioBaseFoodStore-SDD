## ADDED Requirements

### Requirement: Vite + React + TypeScript Setup
The system SHALL use Vite as the build tool with React and TypeScript template.

#### Scenario: Development server running
- **WHEN** `npm run dev` is executed in the frontend directory
- **THEN** the Vite dev server starts on the configured port (default 5173)

#### Scenario: TypeScript compilation
- **WHEN** TypeScript code is written with type errors
- **THEN** the Vite build fails and shows TypeScript errors

### Requirement: Tailwind CSS Integration
The system SHALL integrate Tailwind CSS via PostCSS for utility-first styling.

#### Scenario: Tailwind classes applied
- **WHEN** a component uses Tailwind utility classes (e.g., `bg-blue-500`)
- **THEN** the styles are applied in development and purged in production build

#### Scenario: Custom theme configuration
- **WHEN** the `tailwind.config.js` defines custom colors or fonts
- **THEN** those customizations are available as utility classes

### Requirement: Zustand State Management
The system SHALL use Zustand for client-side state management with optional localStorage persistence.

#### Scenario: Auth store creation
- **WHEN** the auth store is defined with Zustand
- **THEN** it provides state for user, tokens, and actions for login/logout

#### Scenario: State persistence
- **WHEN** the auth store uses `persist` middleware
- **THEN** the state survives page refreshes via localStorage

### Requirement: TanStack Query Setup
The system SHALL use TanStack Query (React Query) for server-state management with caching and background refetching.

#### Scenario: Query client provider
- **WHEN** the React app is wrapped with `QueryClientProvider`
- **THEN** all components can use `useQuery` and `useMutation` hooks

#### Scenario: API data fetching
- **WHEN** a component calls `useQuery({ queryKey: ['products'], queryFn: fetchProducts })`
- **THEN** data is fetched, cached, and stale-while-revalidate behavior is applied

### Requirement: Axios Instance with Interceptors
The system SHALL provide a configured Axios instance with interceptors for JWT handling.

#### Scenario: Automatic token attachment
- **WHEN** any API request is made via the configured Axios instance
- **THEN** the Authorization header with Bearer token is automatically attached

#### Scenario: Token refresh on 401
- **WHEN** an API request returns HTTP 401 (token expired)
- **THEN** the interceptor uses the refresh token to get new tokens and retries the original request

#### Scenario: Logout on refresh failure
- **WHEN** the refresh token is invalid or expired during a 401 retry
- **THEN** the user is logged out and redirected to login page

### Requirement: Feature-Sliced Design Structure
The system SHALL organize frontend code following Feature-Sliced Design (FSD) layers: app, pages, widgets, features, entities, shared.

#### Scenario: Correct import rules
- **WHEN** code in a higher layer (e.g., pages) imports from a lower layer (e.g., shared)
- **THEN** the import is allowed

#### Scenario: Forbidden cross-layer import
- **WHEN** code in a lower layer (e.g., shared) tries to import from a higher layer (e.g., features)
- **THEN** the build should fail or a linting error should be shown

### Requirement: Routing Setup
The system SHALL use React Router with protected routes based on authentication state and user roles.

#### Scenario: Public route access
- **WHEN** an unauthenticated user visits `/login`
- **THEN** the login page is displayed

#### Scenario: Protected route redirect
- **WHEN** an unauthenticated user visits `/profile`
- **THEN** the user is redirected to `/login`

#### Scenario: Role-based route access
- **WHEN** a user with role CLIENT tries to access `/admin`
- **THEN** access is denied (403 or redirect to unauthorized page)
