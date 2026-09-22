import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, Zap, User, LogOut, LogIn, LayoutDashboard,
  Package, Heart, Sun, Moon, MessageSquare, Bell, Check, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { useWishlist } from '../../hooks/useWishlist';
import { useNotifications } from '../../hooks/useNotifications';
import SearchBar from '../../features/search/SearchBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { cartCount, openCart } = useCartStore();
  const { wishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim().length >= 2) {
      navigate(`/shop?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About Us' },
    { to: '/support', label: 'Contact Us' },
  ];

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, background: 'var(--bg-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Main Header Bar (Logo, Search, Actions) */}
      <div style={{ paddingBlock: '0.85rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Brand Logo & Tagline */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'var(--accent-blue)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
              }}
            >
              <Zap size={19} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                SPARKTECH
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em' }} className="desktop-only">
                Robotics &amp; Electronics
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {navLinks.map(({ to, label }) => {
              const isHome = to === '/' && location.pathname === '/' && !location.hash;
              const isActive = to === '/' ? isHome : location.pathname.startsWith(to);

              return (
                <NavLink
                  key={to}
                  to={to}
                  style={{
                    textDecoration: 'none',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: isActive ? 'var(--accent-blue)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Central Search Bar (Desktop) */}
          <div className="desktop-only" style={{ flex: '1 1 340px', maxWidth: '480px' }}>
            <form onSubmit={handleHeaderSearchSubmit} style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search microcontrollers, sensors, motors, robotics kits..."
                style={{
                  width: '100%',
                  padding: '0.6rem 2.8rem 0.6rem 1.1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Mobile Search Toggle */}
            <button
              className="btn btn-ghost mobile-only"
              onClick={() => setSearchOpen(true)}
              style={{ padding: '0.45rem' }}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ padding: '0.45rem' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="btn btn-ghost" style={{ padding: '0.45rem', position: 'relative' }} aria-label="Wishlist">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: 'var(--accent-red)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 17,
                      height: 17,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ padding: '0.45rem', position: 'relative' }}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'var(--accent-amber)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 17,
                        height: 17,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 0.5rem)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        width: 320,
                        maxWidth: 'calc(100vw - 2rem)',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        zIndex: 100,
                      }}
                    >
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Notifications</p>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.78rem', cursor: 'pointer' }}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Bell size={22} style={{ opacity: 0.4, margin: '0 auto 0.4rem' }} />
                            <p style={{ fontSize: '0.82rem' }}>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div
                              key={n._id || i}
                              style={{
                                padding: '0.85rem',
                                borderBottom: '1px solid var(--border)',
                                background: n.read ? 'transparent' : 'rgba(37,99,235,0.05)',
                                display: 'flex',
                                gap: '0.65rem',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.82rem', fontWeight: n.read ? 500 : 700, marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                                  {n.title}
                                </p>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                  {n.message}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {!n.read && (
                                  <button onClick={() => markAsRead(n._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>
                                    <Check size={14} />
                                  </button>
                                )}
                                <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', opacity: 0.7 }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cart Bag */}
            <button
              className="btn btn-ghost"
              onClick={openCart}
              style={{ position: 'relative', padding: '0.45rem' }}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount() > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 17,
                    height: 17,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount()}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', padding: '0.35rem' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-blue), #8B5CF6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 0.5rem)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        minWidth: 190,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        zIndex: 100,
                      }}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user?.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</p>
                      </div>

                      {[
                        { to: '/profile', icon: <User size={15} />, label: 'Profile' },
                        { to: '/orders', icon: <Package size={15} />, label: 'My Orders' },
                        { to: '/support', icon: <MessageSquare size={15} />, label: 'Help & Support' },
                        ...(user?.role === 'admin' || user?.role === 'masteradmin'
                          ? [{ to: '/admin/dashboard', icon: <LayoutDashboard size={15} />, label: 'Admin Panel' }]
                          : []),
                      ].map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.65rem 1rem',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.86rem',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {icon} {label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 1rem',
                          background: 'none',
                          border: 'none',
                          borderTop: '1px solid var(--border)',
                          cursor: 'pointer',
                          color: 'var(--accent-red)',
                          fontSize: '0.86rem',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary desktop-only"
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className="btn btn-ghost mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ padding: '0.45rem' }}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div className="container" style={{ padding: '1rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!isAuthenticated ? (
                <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    <LogIn size={18} /> Sign In / Register
                  </Link>
                </div>
              ) : null}

              {/* Navigation Links in Mobile Drawer */}
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: '0.75rem 0.25rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{label}</span>
                </Link>
              ))}

              {/* Authenticated user links in Mobile Drawer */}
              {isAuthenticated && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.5rem' }}>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    style={{ padding: '0.65rem 0.25rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    style={{ padding: '0.65rem 0.25rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.65rem 0.25rem',
                      color: 'var(--accent-red)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay (for mobile) */}
      <AnimatePresence>
        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
