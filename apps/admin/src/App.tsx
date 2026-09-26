import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminPostsListPage } from './pages/AdminPostsListPage';
import { AdminPostEditPage } from './pages/AdminPostEditPage';
import { AdminProductsListPage } from './pages/AdminProductsListPage';
import { AdminProductEditPage } from './pages/AdminProductEditPage';
import { AdminMaterialsPage } from './pages/AdminMaterialsPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminHomepagePage } from './pages/AdminHomepagePage';
import { AdminNewsletterPage } from './pages/AdminNewsletterPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminHeaderPage } from './pages/AdminHeaderPage';
import { AdminFooterPage } from './pages/AdminFooterPage';
import { AdminPagesListPage } from './pages/AdminPagesListPage';
import { AdminPageEditPage } from './pages/AdminPageEditPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPostsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPostEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPostEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProductsListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProductEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProductEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/materials"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminMaterialsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCategoriesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pages"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPagesListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pages/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPageEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pages/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPageEditPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/header"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminHeaderPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/footer"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminFooterPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homepage"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminHomepagePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/newsletter"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminNewsletterPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminAnalyticsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
};
