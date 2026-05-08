import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/widgets/layout/AppLayout';

// Pages (lazy loaded)
const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/register/RegisterPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ForbiddenPage = lazy(() => import('@/pages/forbidden/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const CategoryListPage = lazy(() => import('@/pages/categories/CategoryListPage'));
const CategoryFormPage = lazy(() => import('@/pages/categories/CategoryFormPage'));

// Loading fallback
const LoadingFallback = () => <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Error pages (no layout) */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Protected routes with AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Category routes (STAFF/ADMIN) */}
          <Route
            path="/categories"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <CategoryListPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/categories/new"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <CategoryFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/categories/:id/edit"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <CategoryFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
