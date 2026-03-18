import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './features/cart/CartDrawer';
import AdminLayout from './components/layout/AdminLayout';
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
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Placeholder pages (you can build these out next)
const NotFoundPage = () => (
  <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
    <p style={{ fontSize:'5rem' }}>⚡</p>
    <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'2.5rem' }}>404 — Page Not Found</h1>
    <p style={{ color:'var(--text-muted)' }}>The component you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary">Back to Home</a>
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
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--accent-blue)' }}
    />
    <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Loading…</p>
  </div>
);

// Layout wrapper (shows Navbar + Footer for non-auth pages)
const AppLayout = ({ children, noLayout }) => (
  <>
    {!noLayout && <Navbar />}
    <main style={{ minHeight: noLayout ? 'unset' : '80vh' }}>{children}</main>
    {!noLayout && <Footer />}
    <CartDrawer />
  </>
);

function AppRoutes() {
  const location = useLocation();

  // Listen for auth:logout event from Axios interceptor
  const { logout } = useAuthStore();
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
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

          {/* Protected routes */}
          <Route path="/cart" element={
            <ProtectedRoute><AppLayout>
              <PageTransition>
                <div style={{ paddingTop:'6rem', minHeight:'80vh' }} className="container">
                  <h1>Cart Page</h1>
                </div>
              </PageTransition>
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
              <PageTransition>
                <div style={{ textAlign:'center', paddingTop:'6rem', minHeight:'80vh' }} className="container">
                  <p style={{ fontSize:'4rem' }}>🎉</p>
                  <h1 style={{ fontFamily:'Outfit,sans-serif', marginBottom:'0.5rem' }}>Order Confirmed!</h1>
                  <p style={{ color:'var(--text-muted)' }}>Check your email for confirmation details.</p>
                </div>
              </PageTransition>
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
          <AppRoutes />
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
