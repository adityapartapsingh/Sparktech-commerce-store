import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, CreditCard, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';

// Address Validation Schema
const checkoutSchema = z.object({
  line1:   z.string().min(5, 'Street address is required'),
  city:    z.string().min(2, 'City is required'),
  state:   z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  phone:   z.string().min(10, 'Valid phone number required'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);

  // Fetch Razorpay key on load
  useEffect(() => {
    api.get('/payments/config').then(res => setRazorpayKey(res.data.data.keyId)).catch(console.error);

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data) => {
    if (items.length === 0) return toast.error('Cart is empty');
    if (!razorpayKey) return toast.error('Payment gateway not ready. Please try again.');
    
    setIsProcessing(true);
    try {
      // 1. Create order on server
      const orderRes = await api.post('/payments/create-order', { shippingAddress: data });
      const { orderId, razorpayOrderId, amount, currency } = orderRes.data.data;

      // 2. Open Razorpay Modal
      const options = {
        key: razorpayKey,
        amount,
        currency,
        name: 'RoboMart',
        description: 'Purchase of electronic parts',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment...', { id: 'verify' });
            // 3. Verify on server
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderId
            });
            toast.success('Payment successful!', { id: 'verify' });
            clearCart();
            navigate('/order-confirmation');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: 'verify' });
          }
        },
        prefill: {
          contact: data.phone,
        },
        theme: {
          color: '#3b82f6', // var(--accent-blue)
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err) {
      setIsProcessing(false);
      toast.error(err.response?.data?.message || 'Failed to initialize checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Zap size={48} color="var(--text-muted)" />
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left: Address Form */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <MapPin color="var(--accent-blue)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Shipping Address</h2>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Street Address / Line 1</label>
              <input type="text" className={`form-input ${errors.line1 ? 'error' : ''}`} placeholder="123 Tech Park" {...register('line1')} />
              {errors.line1 && <span className="form-error">{errors.line1.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">City</label>
                <input type="text" className={`form-input ${errors.city ? 'error' : ''}`} placeholder="Bangalore" {...register('city')} />
                {errors.city && <span className="form-error">{errors.city.message}</span>}
              </div>
              <div>
                <label className="form-label">State</label>
                <input type="text" className={`form-input ${errors.state ? 'error' : ''}`} placeholder="Karnataka" {...register('state')} />
                {errors.state && <span className="form-error">{errors.state.message}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Pincode</label>
                <input type="text" className={`form-input ${errors.pincode ? 'error' : ''}`} placeholder="560001" {...register('pincode')} />
                {errors.pincode && <span className="form-error">{errors.pincode.message}</span>}
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input type="text" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="9876543210" {...register('phone')} />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '6rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '30vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
            {items.map(item => (
              <div key={`${item.productId}-${item.variantId}`} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 6, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    {item.image ? <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Zap size={20} style={{ margin: 14, opacity: 0.3 }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.variantLabel} x {item.quantity}</p>
                </div>
                <div style={{ fontWeight: 600 }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{cartTotal().toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--accent-green)' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'Outfit,sans-serif' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-blue)' }}>₹{cartTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', gap: '0.5rem' }}
          >
            {isProcessing ? (
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
            ) : (
              <>
                <CreditCard size={18} />
                Pay with Razorpay
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} color="var(--accent-green)" />
            <span>Secure encrypted payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
