import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  ShieldCheck, MapPin, CreditCard, ChevronRight, Zap,
  Truck, CheckCircle2, Home, Building2, MapPinned, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const checkoutSchema = z.object({
  line1:   z.string().min(5, 'Street address is required'),
  city:    z.string().min(2, 'City is required'),
  state:   z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  phone:   z.string().min(10, 'Valid phone number required'),
});

/* ── Payment Method Card ─────────────────────────────── */
const PayMethodCard = ({ id, icon: Icon, title, desc, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
      border: `2px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`,
      background: selected ? 'rgba(59,130,246,0.06)' : 'var(--bg-elevated)',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
      background: selected ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: selected ? 'var(--accent-blue)' : 'var(--text-muted)',
    }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.1rem', color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{title}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
    {selected && <CheckCircle2 size={20} color="var(--accent-blue)" />}
  </button>
);

/* ── Saved Address Card ──────────────────────────────── */
const LABEL_ICONS = { Home, Work: Building2, Other: MapPinned };
const SavedAddressCard = ({ addr, selected, onSelect }) => {
  const Icon = LABEL_ICONS[addr.label] || MapPinned;
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '1rem', borderRadius: 'var(--radius-md)',
        border: `2px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`,
        background: selected ? 'rgba(59,130,246,0.05)' : 'var(--bg-elevated)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        background: selected ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? 'var(--accent-blue)' : 'var(--text-muted)',
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{addr.label}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
        </p>
        {addr.phone && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.15rem' }}>Ph: {addr.phone}</p>}
      </div>
      {selected && <CheckCircle2 size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />}
    </button>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [payMethod, setPayMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [selectedAddrId, setSelectedAddrId] = useState(null); // saved address ID
  const [useCustom, setUseCustom] = useState(false);

  // Auto-select first saved address
  useEffect(() => {
    if (user?.addresses?.length > 0 && !selectedAddrId && !useCustom) {
      setSelectedAddrId(user.addresses[0]._id);
    }
  }, [user, selectedAddrId, useCustom]);

  // Fetch Razorpay key + load SDK script
  useEffect(() => {
    api.get('/payments/config').then(res => setRazorpayKey(res.data.data.keyId)).catch(console.error);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const cartItems = items.map(i => ({
    productId: i.productId,
    variantId: i.variantId,
    quantity:  i.quantity,
    name:      i.name,
  }));

  const getShippingAddress = (formData) => {
    if (useCustom || !selectedAddrId) return formData;
    const addr = user?.addresses?.find(a => a._id === selectedAddrId);
    if (!addr) return formData;
    return {
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone || user.phone || '',
    };
  };

  /* ── COD Handler ─────────────────────────────────────────── */
  const placeCOD = async (address) => {
    setIsProcessing(true);
    try {
      await api.post('/payments/cod', { shippingAddress: address, cartItems });
      toast.success('Order placed! Pay on delivery.');
      clearCart();
      navigate('/order-confirmation');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── Razorpay Handler ───────────────────────────────────── */
  const placeRazorpay = async (address) => {
    if (!razorpayKey) return toast.error('Payment gateway not ready. Please try again.');
    setIsProcessing(true);
    try {
      const orderRes = await api.post('/payments/create-order', {
        shippingAddress: address,
        cartItems,
      });
      const { orderId, razorpayOrderId, amount, currency } = orderRes.data.data;

      const options = {
        key: razorpayKey,
        amount, currency,
        name: 'SparkTech',
        description: 'Purchase of electronic parts',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            toast.loading('Verifying payment…', { id: 'verify' });
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              dbOrderId:           orderId,
            });
            toast.success('Payment successful!', { id: 'verify' });
            clearCart();
            navigate('/order-confirmation');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: 'verify' });
          }
        },
        prefill: { contact: address.phone },
        theme: { color: '#3b82f6' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        setIsProcessing(false);
        toast.error(r.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err) {
      setIsProcessing(false);
      toast.error(err.response?.data?.message || 'Failed to initialize checkout');
    }
  };

  /* ── Main Submit ────────────────────────────────────────── */
  const onSubmit = (formData) => {
    if (items.length === 0) return toast.error('Cart is empty');
    const address = getShippingAddress(formData);
    payMethod === 'cod' ? placeCOD(address) : placeRazorpay(address);
  };

  // Allow saved-address checkout without form validation
  const handleSavedAddressSubmit = () => {
    if (items.length === 0) return toast.error('Cart is empty');
    if (!selectedAddrId) return toast.error('Select an address');
    const address = getShippingAddress(null);
    if (!address?.line1) return toast.error('Invalid saved address');
    payMethod === 'cod' ? placeCOD(address) : placeRazorpay(address);
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Zap size={48} color="var(--text-muted)" />
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">Browse Shop</button>
      </div>
    );
  }

  const savedAddresses = user?.addresses || [];
  const usingSavedAddress = !useCustom && selectedAddrId && savedAddresses.length > 0;

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <Helmet>
        <title>Checkout | SparkTech</title>
        <meta name="description" content="Complete your SparkTech order. Secure checkout with Razorpay or Cash on Delivery." />
      </Helmet>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', marginBottom: '2rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left col ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Shipping Address */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <MapPin color="var(--accent-blue)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Shipping Address</h2>
            </div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !useCustom && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {savedAddresses.map(addr => (
                  <SavedAddressCard
                    key={addr._id}
                    addr={addr}
                    selected={selectedAddrId === addr._id}
                    onSelect={() => { setSelectedAddrId(addr._id); setUseCustom(false); }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => { setUseCustom(true); setSelectedAddrId(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '0.5rem 0' }}
                >
                  <MapPinned size={14} /> Use a different address
                </button>
              </div>
            )}

            {/* Manual address form (shown when no saved addresses or user clicked "different address") */}
            {(useCustom || savedAddresses.length === 0) && (
              <>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setUseCustom(false); setSelectedAddrId(savedAddresses[0]._id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '0 0 1rem 0' }}
                  >
                    <Home size={14} /> Use saved address instead
                  </button>
                )}
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
              </>
            )}
          </div>

          {/* Payment Method Selector */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <CreditCard color="var(--accent-blue)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Payment Method</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <PayMethodCard
                id="razorpay"
                icon={CreditCard}
                title="Pay Online — Razorpay"
                desc="UPI, Cards, Net Banking, Wallets. Secure & instant."
                selected={payMethod === 'razorpay'}
                onSelect={setPayMethod}
              />
              <PayMethodCard
                id="cod"
                icon={Truck}
                title="Cash on Delivery (COD)"
                desc={`Pay ₹${cartTotal().toLocaleString('en-IN')} when your package arrives.`}
                selected={payMethod === 'cod'}
                onSelect={setPayMethod}
              />
            </div>
            {payMethod === 'cod' && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={14} /> COD orders are set to <strong>Processing</strong> immediately. Payment collected on delivery.
              </p>
            )}
          </div>
        </div>

        {/* ── Right col: Order Summary ── */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '6rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '30vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
            {items.map(item => (
              <div key={`${item.productId}-${item.variantId}`} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 6, background: 'var(--bg-elevated)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Zap size={20} style={{ margin: 14, opacity: 0.3 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.variantLabel} × {item.quantity}</p>
                </div>
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          {(() => {
            const deliveryFee = cartTotal() >= 500 ? 0 : 50;
            const eta = new Date();
            eta.setDate(eta.getDate() + 5);
            const etaStr = eta.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span><span>₹{cartTotal().toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: deliveryFee === 0 ? 600 : 400 }}>
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                  </span>
                </div>
                {/* ETA line */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', marginTop: '-0.3rem', marginBottom: '0.3rem' }}>
                  <Truck size={14} /> Arriving by {etaStr}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Payment</span>
                  <span style={{ fontWeight: 600, color: payMethod === 'cod' ? 'var(--accent-amber)' : 'var(--accent-blue)' }}>
                    {payMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'Outfit,sans-serif' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent-blue)' }}>₹{(cartTotal() + deliveryFee).toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })()}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type={usingSavedAddress ? 'button' : 'submit'}
            form={usingSavedAddress ? undefined : 'checkout-form'}
            onClick={usingSavedAddress ? handleSavedAddressSubmit : undefined}
            disabled={isProcessing}
            className={`btn ${payMethod === 'cod' ? 'btn-amber' : 'btn-primary'}`}
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', gap: '0.5rem' }}
          >
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
            ) : payMethod === 'cod' ? (
              <><Truck size={18} /> Place COD Order <ChevronRight size={18} /></>
            ) : (
              <><CreditCard size={18} /> Pay with Razorpay <ChevronRight size={18} /></>
            )}
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} color="var(--accent-green)" />
            <span>{payMethod === 'cod' ? 'Pay safely at your doorstep' : 'Secure encrypted payment'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
