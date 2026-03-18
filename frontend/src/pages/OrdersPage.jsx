import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageOpen, Clock, CheckCircle2, Truck, XCircle, ChevronRight, IndianRupee } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const StatusBadge = ({ status }) => {
  const config = {
    pending:    { color: 'var(--accent-amber)', icon: Clock, label: 'Pending Payment' },
    paid:       { color: 'var(--accent-blue)', icon: CheckCircle2, label: 'Confirmed' },
    processing: { color: 'var(--accent-blue)', icon: PackageOpen, label: 'Processing' },
    shipped:    { color: 'var(--accent-blue)', icon: Truck, label: 'Shipped' },
    delivered:  { color: 'var(--accent-green)', icon: CheckCircle2, label: 'Delivered' },
    cancelled:  { color: 'var(--accent-red)', icon: XCircle, label: 'Cancelled' },
    refunded:   { color: 'var(--text-muted)', icon: XCircle, label: 'Refunded' },
  };

  const current = config[status] || config.pending;
  const Icon = current.icon;

  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
      padding: '0.25rem 0.75rem', borderRadius: 99, 
      fontSize: '0.75rem', fontWeight: 600, 
      color: current.color, backgroundColor: `${current.color}15`, border: `1px solid ${current.color}30`
    }}>
      <Icon size={14} />
      {current.label}
    </span>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my');
      return res.data.data;
    }
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Your Orders</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name || 'Customer'}. Here is your order history.</p>
      </div>

      {isLoading ? (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)' }}
          />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <PackageOpen size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No orders yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order, idx) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{ 
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border)', overflow: 'hidden'
              }}
            >
              <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order Placed</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Amount</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-blue)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order ID</p>
                    <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{order._id}</p>
                  </div>
                </div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map(item => (
                  <div key={`${item.product}-${item.variant}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.variantLabel} x {item.quantity}</p>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                 <button onClick={() => navigate(`/products/${order.items[0]?.product}`)} className="btn btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                   View Product <ChevronRight size={14} style={{ marginLeft: '0.25rem' }} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
