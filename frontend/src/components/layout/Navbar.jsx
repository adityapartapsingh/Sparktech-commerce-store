import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, Zap, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartCount, openCart } = useCartStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/products', label: 'Products' },
    { to: '/products?featured=true', label: 'Featured' },
    { to: '/products?category=microcontrollers', label: 'Microcontrollers' },
    { to: '/products?category=sensors', label: 'Sensors' },
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
          background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
          transition: 'all 0.3s ease',
          padding: '1rem 0',
        }}
      >
        <div className="container" style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-amber))',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} color="#0A0A0F" fill="#0A0A0F" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.3rem' }}>
              <span className="gradient-text">Robo</span>
              <span style={{ color:'var(--text-primary)' }}>Mart</span>
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
                        ...(user?.role==='admin' ? [{ to:'/admin', icon:<LayoutDashboard size={16}/>, label:'Admin' }] : []),
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
              zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center',
              paddingTop:'20vh',
            }}
          >
            <motion.form
              initial={{ y:-20, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              exit={{ y:-20, opacity:0 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              style={{ width:'min(600px, 90vw)', position:'relative' }}
            >
              <Search size={20} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, components, brands..."
                className="input"
                style={{ paddingLeft:48, paddingRight:48, padding:'1rem 1rem 1rem 3rem', fontSize:'1.1rem', borderRadius:'var(--radius-lg)' }}
              />
              <button type="button" onClick={() => setSearchOpen(false)} style={{
                position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
              }}>
                <X size={20} />
              </button>
            </motion.form>
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
