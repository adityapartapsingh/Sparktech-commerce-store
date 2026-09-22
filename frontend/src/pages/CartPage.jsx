import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Zap, ArrowLeft, ChevronRight, Truck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';
import FallbackState from '../components/ui/FallbackState';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCartStore();

  const handleRemove = async (productId, variantId) => {
    const previous = [...items];
    removeItem(productId, variantId);
    try {
      await api.delete(`/cart/remove/${productId}/${variantId}`);
      toast.success('Item removed');
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

  const deliveryFee = cartTotal() >= 500 ? 0 : 50;
  const total = cartTotal() + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
        <Helmet><title>Cart | SparkTech</title></Helmet>
        <FallbackState
          type="empty"
          title="Your cart is empty"
          message="Looks like you haven't added any components yet. Browse our catalog to find what you need for your project."
          action={{ label: 'Browse Shop', to: '/shop' }}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <Helmet><title>Cart ({cartCount()}) | SparkTech</title></Helmet>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)' }}>Shopping Cart</span>
      </div>

      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', marginBottom: '0.5rem' }}>
        Shopping Cart
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {cartCount()} item{cartCount() !== 1 ? 's' : ''} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variantId}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                {/* Image */}
                <div style={{
                  width: 100, height: 100, borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)',
                }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={32} color="var(--accent-blue)" style={{ opacity: 0.2 }} />
                      </div>
                  }
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/shop`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                  </Link>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    Variant: {item.variantLabel}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                      <button
                        onClick={() => handleQtyChange(item, item.quantity - 1)}
                        style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '1rem', fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity >= item.stock ? 0.4 : 1 }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Stock warning */}
                    {item.stock <= 5 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 500 }}>
                        Only {item.stock} left
                      </span>
                    )}
                  </div>
                </div>

                {/* Price + Remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent-blue)' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  {item.quantity > 1 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ₹{item.price.toLocaleString('en-IN')} each
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(item.productId, item.variantId)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Card */}
        <div style={{
          background: 'var(--bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          maxWidth: 500,
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', fontFamily: 'Outfit,sans-serif' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal ({cartCount()} items)</span>
              <span>₹{cartTotal().toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Delivery Fee</span>
              <span style={{ color: deliveryFee === 0 ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: deliveryFee === 0 ? 600 : 400 }}>
                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                Add ₹{(500 - cartTotal()).toLocaleString('en-IN')} more for free delivery
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Truck size={14} /> Estimated delivery: 3-5 business days
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif', marginBottom: '1.5rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-blue)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', gap: '0.5rem' }}>
            Proceed to Checkout <ChevronRight size={18} />
          </Link>

          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginTop: '1rem' }}>
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
