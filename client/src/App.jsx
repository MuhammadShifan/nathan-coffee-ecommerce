import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';

// HomePage is statically imported for instant First Contentful Paint (no waterfall)
import HomePage from './pages/HomePage';

// Lazy-loaded secondary user pages
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));

// Lazy-loaded admin pages (drastically reduces visitor bundle size)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));

import { useAuth } from './context/AuthContext';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Lightweight branded page loading fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-pink-200 border-t-brand-pink-600 rounded-full animate-spin" />
      <span className="text-xs font-bold text-brand-coffee-700 animate-pulse tracking-wide">
        Loading Nathan Coffee...
      </span>
    </div>
  </div>
);

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-brand-coffee-50 font-sans selection:bg-brand-pink-500 selection:text-white">
      {/* Scroll restoration on route change */}
      <ScrollToTop />

      {/* Toast Notification Container */}
      <Toast />

      {/* Global OTP Auth Modal */}
      <AuthModal />

      {/* Cart Slide-out Drawer */}
      <CartDrawer />

      {/* Render Public Header on user-facing pages */}
      {!isAdminRoute && <Navbar />}

      {/* Main Page Routes wrapped in Suspense */}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public User Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
            <Route path="/myorders" element={<Navigate to="/my-orders" replace />} />
            <Route path="/track" element={<Navigate to="/my-orders" replace />} />
            <Route path="/track-order" element={<Navigate to="/my-orders" replace />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/policy/:type" element={<PolicyPage />} />

            {/* Admin Pages */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedAdminRoute>
                  <AdminProductsPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <AdminOrdersPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedAdminRoute>
                  <AdminMessagesPage />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Render Public Footer on user-facing pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
