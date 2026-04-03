import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldPlus, LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Store, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    ...(user?.role === 'masteradmin' ? [{ name: 'System Logs', path: '/admin/logs', icon: <Settings size={20} /> }] : [])
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ 
              background: 'var(--bg-card)', borderRight: '1px solid var(--border)', 
              display: 'flex', flexDirection: 'column', overflow: 'hidden', whiteSpace: 'nowrap' 
            }}
          >
            <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', borderRadius: '10px', color: '#fff' }}>
                <ShieldPlus size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                  Admin <span style={{ color: 'var(--accent-purple)' }}>Portal</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {user?.role === 'masteradmin' ? 'Master Access' : 'Admin Access'}
                </p>
              </div>
            </div>

            <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                Main Menu
              </div>
              
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', 
                    borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 500,
                    transition: 'all 0.2s',
                    background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent'
                  })}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </nav>

            <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => navigate('/')} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', 
                borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', 
                color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Store size={20} />
                Public Storefront
              </button>

              <button onClick={handleLogout} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', 
                borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: 'var(--accent-red)', fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%'
              }}>
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{ 
          height: '70px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem'
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ textAlign: 'right' }}>
               <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{user?.name}</p>
               <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</p>
             </div>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-purple), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
               {user?.name?.charAt(0).toUpperCase() || 'A'}
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
