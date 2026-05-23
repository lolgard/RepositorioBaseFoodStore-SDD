import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/widgets/layout/AppLayout';
import { useAuthStore } from '@/shared/store/auth-store';

// Pages (lazy loaded)
const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/register/RegisterPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ForbiddenPage = lazy(() => import('@/pages/forbidden/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const CategoryListPage = lazy(() => import('@/pages/categories/CategoryListPage'));
const CategoryFormPage = lazy(() => import('@/pages/categories/CategoryFormPage'));
const IngredientListPage = lazy(() => import('@/pages/ingredients/IngredientListPage'));
const IngredientFormPage = lazy(() => import('@/pages/ingredients/IngredientFormPage'));
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const AddressListPage = lazy(() => import('@/pages/addresses/AddressListPage'));
const AddressFormPage = lazy(() => import('@/pages/addresses/AddressFormPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const OrderListPage = lazy(() => import('@/pages/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
const SystemConfigPage = lazy(() => import('@/pages/admin/SystemConfigPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/orders/OrderConfirmationPage'));
const PaymentFeedbackPage = lazy(() => import('@/pages/orders/PaymentFeedbackPage'));
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserFormPage = lazy(() => import('@/pages/users/UserFormPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));

// Redirect: ADMIN → dashboard, others → catalog
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/metrics" replace />;
  }
  return <ProductListPage />;
}

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

          {/* Public routes with AppLayout (no auth required) */}
          <Route
            path="/"
            element={
              <AppLayout>
                <RootRedirect />
              </AppLayout>
            }
          />
          <Route
            path="/home"
            element={
              <AppLayout>
                <HomePage />
              </AppLayout>
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

          {/* Ingredient routes (STAFF/ADMIN) */}
          <Route
            path="/ingredients"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <IngredientListPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/ingredients/new"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <IngredientFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/ingredients/:id/edit"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <IngredientFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Product routes (public - no auth required) */}
          <Route
            path="/products"
            element={
              <AppLayout>
                <ProductListPage />
              </AppLayout>
            }
          />
          <Route
            path="/products/new"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <ProductFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <ProductFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <AppLayout>
                <ProductDetailPage />
              </AppLayout>
            }
          />

          {/* Address routes (CLIENTE only) */}
          <Route
            path="/addresses"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE']}>
                <AppLayout>
                  <AddressListPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/addresses/new"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE']}>
                <AppLayout>
                  <AddressFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/addresses/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE']}>
                <AppLayout>
                  <AddressFormPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Cart (public - guests can browse, CartPage handles admin/guest cases) */}
          <Route
            path="/cart"
            element={
              <AppLayout>
                <CartPage />
              </AppLayout>
            }
          />

          {/* Order routes (CLIENTE / GESTOR only — ADMIN excluded) */}
          <Route
            path="/orders"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE', 'GESTOR']}>
                <AppLayout>
                  <OrderListPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE', 'GESTOR']}>
                <AppLayout>
                  <OrderDetailPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Order confirmation (CLIENTE / GESTOR only) */}
          <Route
            path="/orders/:id/confirmed"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE', 'GESTOR']}>
                <AppLayout>
                  <OrderConfirmationPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Payment feedback (CLIENTE / GESTOR only) */}
          <Route
            path="/payment/feedback"
            element={
              <RoleProtectedRoute allowedRoles={['CLIENTE', 'GESTOR']}>
                <AppLayout>
                  <PaymentFeedbackPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Profile page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/config"
            element={
              <RoleProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <SystemConfigPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Admin metrics dashboard */}
          <Route
            path="/admin/metrics"
            element={
              <RoleProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* User admin routes (ADMIN only) */}
          <Route
            path="/users"
            element={
              <RoleProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <UserListPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <RoleProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <UserFormPage />
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
