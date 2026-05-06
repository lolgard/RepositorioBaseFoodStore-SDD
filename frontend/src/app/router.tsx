import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

// Pages (lazy loaded)
const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/register/RegisterPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Loading fallback
const LoadingFallback = () => <div>Cargando...</div>;

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>App Layout Placeholder</div>
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            {/* Add more protected routes here */}
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
