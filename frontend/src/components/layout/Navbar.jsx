import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, Zap, User, LogOut, LayoutDashboard, Package, Heart, Sun, Moon, MessageSquare, Bell, Check, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { useWishlist } from '../../hooks/useWishlist';
import { useNotifications } from '../../hooks/useNotifications';
import SearchBar from '../../features/search/SearchBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { cartCount, openCart } = useCartStore();
  const { wishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/products?featured=true', label: 'Featured' },
    { to: '/products?category=microcontrollers', label: 'Microcontrollers' },
    { to: '/products?category=sensors', label: 'Sensors' },
    { to: '/services', label: 'Services' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? 'var(--bg-card)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
          transition: 'all 0.3s ease',
          padding: '1rem 0',
        }}
      >
        <div className="container" style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--accent-blue)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.2rem', color: 'var(--text-primary)' }}>
              SparkTech
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display:'flex', gap:'0.25rem', flex:1 }} className="desktop-nav">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'var(--transition)',
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginLeft:'auto' }}>
            {/* Search */}
            <button className="btn btn-ghost" onClick={() => setSearchOpen(true)} style={{ padding:'0.5rem' }}>
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="btn btn-ghost" style={{ padding: '0.5rem', position: 'relative' }}>
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0, right: 0,
                      background: 'var(--accent-red)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 18, height: 18,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div style={{ position: 'relative' }}>
                <button className="btn btn-ghost" onClick={() => setNotifOpen(!notifOpen)} style={{ padding: '0.5rem', position: 'relative' }}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: 0, right: 0,
                        background: 'var(--accent-amber)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 18, height: 18,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', width: 320,
                        overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        zIndex: 100,
                      }}
                    >
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</p>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', cursor: 'pointer' }}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Bell size={24} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                            <p style={{ fontSize: '0.85rem' }}>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} style={{
                              padding: '1rem', borderBottom: '1px solid var(--border)',
                              background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                              display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: n.read ? 500 : 600, marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{n.title}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {!n.read && (
                                  <button onClick={() => markAsRead(n._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '0.2rem' }} title="Mark as read">
                                    <Check size={14} />
                                  </button>
                                )}
                                <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.2rem' }} title="Delete">
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

            {/* Cart */}
            <button
              className="btn btn-ghost"
              onClick={openCart}
              style={{ position:'relative', padding:'0.5rem' }}
            >
              <ShoppingCart size={20} />
              {cartCount() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0, right: 0,
                    background: 'var(--accent-blue)',
                    color: 'var(--bg-primary)',
                    borderRadius: '50%',
                    width: 18, height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {cartCount()}
                </motion.span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div style={{ position:'relative' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}
                >
                  <div style={{
                    width:32, height:32, borderRadius:'50%',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    display: 'flex', alignItems:'center', justifyContent:'center',
                    fontSize: '0.8rem', fontWeight: 700, color: 'white',
                  }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity:0, y:10, scale:0.95 }}
                      animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:10, scale:0.95 }}
                      style={{
                        position:'absolute', right:0, top:'calc(100% + 0.5rem)',
                        background:'var(--bg-card)', border:'1px solid var(--border)',
                        borderRadius:'var(--radius-md)', minWidth:180,
                        overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.4)',
                      }}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--border)' }}>
                        <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{user?.name}</p>
                        <p style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{user?.email}</p>
                      </div>
                      {[
                        { to:'/profile', icon:<User size={16}/>, label:'Profile' },
                        { to:'/orders', icon:<Package size={16}/>, label:'Orders' },
                        { to:'/support', icon:<MessageSquare size={16}/>, label:'Support' },
                        ...(user?.role==='admin' || user?.role==='masteradmin' ? [{ to:'/admin/dashboard', icon:<LayoutDashboard size={16}/>, label:'Admin Panel' }] : []),
                      ].map(({ to, icon, label }) => (
                        <Link key={to} to={to} onClick={() => setDropdownOpen(false)} style={{
                          display:'flex', alignItems:'center', gap:'0.75rem',
                          padding:'0.75rem 1rem', textDecoration:'none',
                          color:'var(--text-secondary)', fontSize:'0.9rem', transition:'var(--transition)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {icon} {label}
                        </Link>
                      ))}
                      <button onClick={handleLogout} style={{
                        width:'100%', display:'flex', alignItems:'center', gap:'0.75rem',
                        padding:'0.75rem 1rem', background:'none', border:'none', cursor:'pointer',
                        color:'var(--accent-red)', fontSize:'0.9rem', borderTop:'1px solid var(--border)',
                        transition:'var(--transition)', textAlign:'left',
                      }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding:'0.5rem 1.25rem' }}>
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="btn btn-ghost mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ padding:'0.5rem', display:'none' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height:0, opacity:0 }}
              animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }}
              style={{
                background:'var(--bg-card)',
                borderTop:'1px solid var(--border)',
                overflow:'hidden',
              }}
            >
              <div className="container" style={{ padding:'1rem 0', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                    padding:'0.75rem 0', color:'var(--text-secondary)',
                    textDecoration:'none', fontSize:'1rem', fontWeight:500,
                    borderBottom:'1px solid var(--border)',
                  }}>
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            onClick={() => setSearchOpen(false)}
            style={{
              position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center',
              paddingTop:'18vh',
            }}
          >
            <motion.div
              initial={{ y:-20, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              exit={{ y:-20, opacity:0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width:'min(600px, 90vw)' }}
            >
              <SearchBar onClose={() => setSearchOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
