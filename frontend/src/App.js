import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './features/cart/CartDrawer';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import FallbackState from './components/ui/FallbackState';
import './index.css';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPageAdmin = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminLogsPage      = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));

// Placeholder pages (you can build these out next)
const NotFoundPage = () => (
  <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <FallbackState
      type="error"
      title="404 — Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      action={{ label: 'Back to Home', to: '/' }}
    />
  </div>
);

// Route guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin' && user?.role !== 'masteradmin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const PageFallback = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
    <div className="spinner-lg" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 0.7s linear infinite' }} />
    <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Loading…</p>
  </div>
);

// Layout wrapper (shows Navbar + Footer for non-auth pages)
const AppLayout = ({ children, noLayout }) => (
  <>
    {!noLayout && <Navbar />}
    <main style={{ minHeight: noLayout ? 'unset' : '80vh', paddingTop: noLayout ? 0 : '72px' }}>{children}</main>
    {!noLayout && <Footer />}
    <CartDrawer />
  </>
);

function AppRoutes() {
  const location = useLocation();
  const { initTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => { initTheme(); }, [initTheme]);

  // Listen for auth:logout event from Axios interceptor
  const { logout } = useAuthStore();
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);

    // ── Global JS error + unhandled promise rejection toasts ──
    const handleUnhandledRejection = (event) => {
      const msg = event.reason?.message || 'An unexpected error occurred';
      // Don't re-toast errors already handled by axios interceptor
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('401')) return;
      toast.error(msg, { id: 'unhandled-rejection', duration: 5000 });
    };
    const handleGlobalError = (event) => {
      // Ignore ResizeObserver loop warnings (browser noise)
      if (event.message?.includes('ResizeObserver')) return;
      toast.error(event.message || 'An unexpected error occurred', {
        id: 'global-error', duration: 5000,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [logout]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={
            <AppLayout><PageTransition><HomePage /></PageTransition></AppLayout>
          } />
          <Route path="/products" element={
            <AppLayout><PageTransition><ProductListPage /></PageTransition></AppLayout>
          } />
          <Route path="/products/:slug" element={
            <AppLayout><PageTransition><ProductDetailPage /></PageTransition></AppLayout>
          } />

          {/* Auth routes (guest only) */}
          <Route path="/login" element={
            <GuestRoute><AppLayout noLayout><LoginPage /></AppLayout></GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute><AppLayout noLayout><RegisterPage /></AppLayout></GuestRoute>
          } />
          <Route path="/forgot-password" element={
            <GuestRoute><AppLayout noLayout><ForgotPasswordPage /></AppLayout></GuestRoute>
          } />
          <Route path="/reset-password/:token" element={
            <GuestRoute><AppLayout noLayout><ResetPasswordPage /></AppLayout></GuestRoute>
          } />

          {/* Protected routes */}
          <Route path="/cart" element={
            <ProtectedRoute><AppLayout>
              <PageTransition><CartPage /></PageTransition>
            </AppLayout></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><AppLayout>
              <PageTransition><WishlistPage /></PageTransition>
            </AppLayout></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute><AppLayout><PageTransition><CheckoutPage /></PageTransition></AppLayout></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><AppLayout><PageTransition><OrdersPage /></PageTransition></AppLayout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><AppLayout><PageTransition><ProfilePage /></PageTransition></AppLayout></ProtectedRoute>
          } />
          <Route path="/order-confirmation" element={
            <ProtectedRoute><AppLayout>
              <PageTransition><OrderConfirmationPage /></PageTransition>
            </AppLayout></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/login" element={
             <PageTransition><AdminLoginPage /></PageTransition>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminLayout><PageTransition><AdminDashboard /></PageTransition></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly><AdminLayout><PageTransition><AdminProductsPage /></PageTransition></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly><AdminLayout><PageTransition><AdminOrdersPageAdmin /></PageTransition></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute adminOnly><AdminLayout><PageTransition><AdminCustomersPage /></PageTransition></AdminLayout></ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute adminOnly><AdminLayout><PageTransition><AdminLogsPage /></PageTransition></AdminLayout></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary:'var(--accent-blue)', secondary:'var(--bg-primary)' } },
              error: { iconTheme: { primary:'var(--accent-red)', secondary:'var(--bg-primary)' } },
            }}
          />
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
