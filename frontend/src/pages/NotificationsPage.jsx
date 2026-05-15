import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Clock, Info, Package, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [page, setPage] = React.useState(1);
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, unreadCount, pagination } = useNotifications(page);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={20} />;
      case 'review': return <MessageSquare size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'order': return 'var(--accent-blue)';
      case 'review': return 'var(--accent-amber)';
      default: return 'var(--accent-purple)';
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '85vh', maxWidth: '800px' }}>
      <Helmet>
        <title>Notifications | SparkTech</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Stay updated with your orders and support tickets.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="btn btn-ghost"
            style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Check size={18} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)' }}
          />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', 
            padding: '5rem 2rem', 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border)'
          }}
        >
          <Bell size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>All caught up!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any notifications at the moment.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="popLayout">
            {notifications.map((n, idx) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: n.read ? 'var(--bg-card)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(59, 130, 246, 0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: n.read ? 0.7 : 1,
                  boxShadow: n.read ? 'none' : '0 10px 30px rgba(59, 130, 246, 0.1)'
                }}
              >
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  background: n.read ? 'var(--bg-secondary)' : `${getStatusColor(n.type)}20`,
                  color: n.read ? 'var(--text-muted)' : getStatusColor(n.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: n.read ? 600 : 700, 
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {n.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="btn btn-ghost"
                          style={{ padding: '0.4rem', color: 'var(--accent-blue)' }}
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n._id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem', color: 'var(--accent-red)' }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.6, 
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      {new Date(n.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {n.link && (
                      <Link 
                        to={n.link}
                        onClick={() => !n.read && markAsRead(n._id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem', 
                          color: 'var(--accent-blue)', 
                          fontSize: '0.9rem', 
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        View Details <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }} style={{ padding: '0.5rem' }}>
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--text-muted)' }}>…</span>}
                <button className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setPage(p); window.scrollTo(0, 0); }} style={{ minWidth: 40, height: 40, padding: 0 }}>
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button className="btn btn-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }} style={{ padding: '0.5rem' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
