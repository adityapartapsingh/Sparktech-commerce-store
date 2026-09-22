import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Github, ArrowLeft } from 'lucide-react';
import { apiBase as API_BASE } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Helmet } from 'react-helmet-async';
import CircuitBackground from '../components/ui/CircuitBackground';

const LoginPage = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const [mode, setMode] = useState(() => {
    if (initialMode) return initialMode;
    return location.pathname.includes('register') ? 'register' : 'login';
  });

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const role = user?.role;
      navigate(role === 'admin' || role === 'masteradmin' ? '/admin/dashboard' : '/');
    }
  }, [isAuthenticated, user, navigate]);

  const switchMode = (newMode) => {
    setMode(newMode);
    navigate(newMode === 'register' ? '/register' : '/login', { replace: true });
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleGithubAuth = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const isLogin = mode === 'login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        background: 'var(--bg-primary, #0B0F17)',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Helmet>
        <title>{isLogin ? 'Sign In | SparkTech' : 'Create Account | SparkTech'}</title>
        <meta
          name="description"
          content="Fast, passwordless sign in to SparkTech electronics & robotics store."
        />
      </Helmet>

      {/* PCB Circuit Vector Animation Layer (Clean mode without corner text) */}
      <CircuitBackground showTelemetry={false} />

      {/* Auth Card Stage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 10,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.35)',
              }}
            >
              <Zap size={20} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              SparkTech
            </span>
          </Link>
        </div>

        {/* The Clean Auth Panel */}
        <div
          className="hardware-panel clean-auth-card"
          style={{
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {/* Subtle Corner CAD Crosshairs */}
          <span className="cad-crosshair top-left">+</span>
          <span className="cad-crosshair top-right">+</span>
          <span className="cad-crosshair bottom-left">+</span>
          <span className="cad-crosshair bottom-right">+</span>

          {/* Animated Segmented Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-elevated, #161F30)',
              padding: 4,
              borderRadius: 'var(--radius-md, 10px)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                position: 'relative',
                background: 'transparent',
                color: isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
                outline: 'none',
              }}
            >
              {isLogin && (
                <motion.div
                  layoutId="auth-tab-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--bg-card, #111827)',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border)',
                    zIndex: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 2 }}>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                position: 'relative',
                background: 'transparent',
                color: !isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
                outline: 'none',
              }}
            >
              {!isLogin && (
                <motion.div
                  layoutId="auth-tab-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--bg-card, #111827)',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border)',
                    zIndex: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 2 }}>Create Account</span>
            </button>
          </div>

          {/* Heading with smooth crossfade */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', minHeight: 64 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h1
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.35rem',
                    letterSpacing: '-0.02em',
                    marginBottom: '0.35rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {isLogin ? 'Welcome Back' : 'Join SparkTech'}
                </h1>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.84rem',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {isLogin
                    ? 'Sign in to access your orders and workbench'
                    : 'Instant access for makers, researchers, and labs'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* OAuth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Google OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleGoogleAuth}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.8rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated, #161F30)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
            </motion.button>

            {/* GitHub OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleGithubAuth}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.8rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border)',
                background: '#0D1117',
                color: '#F0F6FC',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              <Github size={18} />
              <span>{isLogin ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
            </motion.button>
          </div>

          {/* Minimal security note */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Zero passwords needed. Protected by Google & GitHub OAuth.
            </p>
          </div>
        </div>

        {/* Return to store link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to store</span>
          </Link>
        </div>
      </motion.div>

      <style>{`
        .clean-auth-card {
          padding: 2rem 1.75rem;
        }
        @media (max-width: 480px) {
          .clean-auth-card {
            padding: 1.5rem 1.15rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
