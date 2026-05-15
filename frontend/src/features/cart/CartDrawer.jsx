import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, cartTotal } = useCartStore();

  const handleRemove = async (productId, variantId) => {
    const previous = [...items];
    removeItem(productId, variantId);
    try {
      await api.delete(`/cart/remove/${productId}/${variantId}`);
    } catch {
      useCartStore.getState().rollback(previous);
      toast.error('Failed to remove item');
    }
  };

  const handleQtyChange = async (item, newQty) => {
    const previous = [...items];
    updateQuantity(item.productId, item.variantId, newQty);
    try {
      await api.patch('/cart/update', { productId: item.productId, variantId: item.variantId, quantity: newQty });
    } catch {
      useCartStore.getState().rollback(previous);
      toast.error('Failed to update quantity');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 1500,
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(420px, 100vw)',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              zIndex: 1600,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingCart size={20} color="var(--accent-blue)" />
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>
                  Cart <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({items.length} items)</span>
                </h2>
              </div>
              <button onClick={closeCart} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem 0' }}>
                  <Zap size={48} color="var(--accent-blue)" style={{ opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Your cart is empty</p>
                  <Link to="/shop" onClick={closeCart} className="btn btn-primary">Browse Shop</Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)' }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={24} color="var(--accent-blue)" style={{ opacity: 0.3 }} /></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>{item.variantLabel}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button onClick={() => handleQtyChange(item, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item, item.quantity + 1)} disabled={item.quantity >= item.stock} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={12} />
                          </button>
                          <button onClick={() => handleRemove(item.productId, item.variantId)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.25rem' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-blue)' }}>
                    ₹{cartTotal().toLocaleString('en-IN')}
                  </span>
                </div>
                <Link to="/checkout" onClick={closeCart} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
