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

          {/* Product routes (STAFF/ADMIN) */}
          <Route
            path="/products"
            element={
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <ProductListPage />
                </AppLayout>
              </RoleProtectedRoute>
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
              <RoleProtectedRoute requiredRole="STAFF">
                <AppLayout>
                  <ProductDetailPage />
                </AppLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Address routes (authenticated users) */}
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddressListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddressFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddressFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Cart */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CartPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Order routes (authenticated users) */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Order confirmation */}
          <Route
            path="/orders/:id/confirmed"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderConfirmationPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Payment feedback */}
          <Route
            path="/payment/feedback"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentFeedbackPage />
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
