import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, Mail, ArrowRight, ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: CheckCircle2, label: 'Order Placed', desc: 'Your order has been confirmed', color: 'var(--accent-green)' },
    { icon: Mail, label: 'Email Sent', desc: 'Confirmation sent to your email', color: 'var(--accent-blue)' },
    { icon: Package, label: 'Processing', desc: 'We are preparing your order', color: 'var(--accent-amber)' },
    { icon: Truck, label: 'Shipping', desc: 'Estimated delivery in 3-5 days', color: 'var(--text-muted)' },
  ];

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
      <Helmet>
        <title>Order Confirmed | SparkTech</title>
        <meta name="description" content="Your SparkTech order has been confirmed." />
      </Helmet>

      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(16,185,129,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 40px rgba(16,185,129,0.15)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 10 }}
        >
          <CheckCircle2 size={48} color="var(--accent-green)" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Thank you for your purchase! We've sent a confirmation email with your order details. You can track your order status anytime.
        </p>
      </motion.div>

      {/* Order Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '0',
          maxWidth: 700, width: '100%', marginBottom: '3rem',
          flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: i <= 1 ? `${step.color}15` : 'var(--bg-elevated)',
                border: `2px solid ${i <= 1 ? step.color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <step.icon size={22} color={i <= 1 ? step.color : 'var(--text-muted)'} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: i <= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 120 }}>
                {step.desc}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 40, height: 2,
                background: i < 1 ? 'var(--accent-green)' : 'var(--border)',
                marginTop: '-2rem',
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-primary"
          style={{ padding: '0.875rem 2rem', fontSize: '1rem', gap: '0.5rem' }}
        >
          <Package size={18} /> View My Orders <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-outline"
          style={{ padding: '0.875rem 2rem', fontSize: '1rem', gap: '0.5rem' }}
        >
          <ShoppingCart size={18} /> Continue Shopping
        </button>
      </motion.div>

      {/* Trust footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ marginTop: '3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}
      >
        Need help? Contact us at <a href="mailto:support@SparkTech.com" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>support@SparkTech.com</a>
      </motion.p>
    </div>
  );
};

export default OrderConfirmationPage;
