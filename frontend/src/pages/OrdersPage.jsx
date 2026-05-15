import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageOpen, Clock, CheckCircle2, Truck, XCircle,
  ChevronRight, FileText, RotateCcw, X, ExternalLink,
  CreditCard, RefreshCw, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import InvoiceModal from '../components/InvoiceModal';
import OrderTimeline from '../components/OrderTimeline';

/* ── Status Badge ─────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const config = {
    pending:    { color: 'var(--accent-amber)', icon: Clock,         label: 'Pending Payment' },
    paid:       { color: 'var(--accent-blue)',  icon: CheckCircle2,  label: 'Confirmed' },
    processing: { color: 'var(--accent-blue)',  icon: PackageOpen,   label: 'Processing' },
    shipped:    { color: 'var(--accent-blue)',  icon: Truck,         label: 'Shipped' },
    delivered:  { color: 'var(--accent-green)', icon: CheckCircle2,  label: 'Delivered' },
    cancelled:  { color: 'var(--accent-red)',   icon: XCircle,       label: 'Cancelled' },
    refunded:   { color: 'var(--text-muted)',   icon: XCircle,       label: 'Refunded' },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: c.color, backgroundColor: `${c.color}15`, border: `1px solid ${c.color}30` }}>
      <Icon size={14} />{c.label}
    </span>
  );
};

/* ── Cancel Modal ─────────────────────────────────────── */
const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery time too long',
  'Payment issue',
  'Product no longer needed',
  'Other',
];

const CancelModal = ({ order, onConfirm, onClose, isPending }) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 460, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(239,68,68,0.05)' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-red)' }}>Cancel Order</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent-red)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Reason pills */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>Why are you cancelling? *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {CANCEL_REASONS.map(r => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1.5px solid ${reason === r ? 'var(--accent-red)' : 'var(--border)'}`, background: reason === r ? 'rgba(239,68,68,0.1)' : 'transparent', color: reason === r ? 'var(--accent-red)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Optional comment */}
          <div>
            <label className="form-label">Additional comments (optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Any other details that might help us improve..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ resize: 'vertical', marginTop: '0.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Keep Order</button>
            <button
              onClick={() => onConfirm({ reason, comment })}
              disabled={!reason || isPending}
              style={{ flex: 1, padding: '0.7rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: reason ? 'var(--accent-red)' : 'var(--bg-elevated)', color: reason ? '#fff' : 'var(--text-muted)', cursor: reason ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.9rem' }}>
              <XCircle size={16} /> {isPending ? 'Cancelling…' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Review Modal ─────────────────────────────────────── */
const ReviewModal = ({ product, onClose }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.post('/reviews', { productId: product.id, orderId: product.orderId, rating, title, comment }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries(['my-orders']);
      queryClient.invalidateQueries(['my-reviewed-items']);
      onClose();
    },
    onError: (e) => {
      if (e.response?.status === 409) {
        toast.error('You have already reviewed this product from this order.');
        onClose();
      } else {
        toast.error(e.response?.data?.message || 'Failed to submit review');
      }
    },
  });

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 460, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>Write a Review</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{product.name}</p>
          
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Rating *</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star
                    size={32}
                    fill={(hoveredRating || rating) >= star ? 'var(--accent-amber)' : 'transparent'}
                    color={(hoveredRating || rating) >= star ? 'var(--accent-amber)' : 'var(--border)'}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="form-label">Review Title (optional)</label>
            <input type="text" className="input" placeholder="Summarize your experience" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
          </div>

          <div>
            <label className="form-label">Review (optional)</label>
            <textarea className="input" rows={4} placeholder="What did you like or dislike? How did it fit?" value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} style={{ resize: 'vertical' }} />
          </div>

          <button onClick={() => mutation.mutate()} disabled={!rating || mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem' }}>
            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Return Modal (2-step) ────────────────────────────── */
const REASONS = [
  'Product damaged / defective',
  'Wrong item delivered',
  'Item not as described',
  'Missing parts / accessories',
  'Size / variant mismatch',
  'Product stopped working',
  'Changed my mind',
  'Other',
];
const RESOLUTIONS = [
  'Full refund to original payment method',
  'Partial refund',
  'Store credit / wallet',
  'Replacement only',
];

const ReturnModal = ({ order, onClose }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Step 1
  const [type, setType] = useState('return');
  const [selectedItems, setSelectedItems] = useState(
    order.items.map(i => i.name)   // default: all items selected
  );
  const [reason, setReason] = useState('');

  // Step 2
  const [desc, setDesc] = useState('');
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');

  const toggleItem = (name) =>
    setSelectedItems(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );

  const mutation = useMutation({
    mutationFn: () => api.post(`/orders/${order._id}/return`, {
      type,
      reason,
      description: desc,
      itemsAffected: selectedItems,
      preferredResolution: resolution,
      contactPhone: phone,
      bankAccount: bank,
    }),
    onSuccess: () => {
      toast.success('Request submitted! We\'ll contact you within 24 hours.');
      queryClient.invalidateQueries(['my-orders']);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit request'),
  });

  const canGoNext = reason && selectedItems.length > 0;
  const canSubmit = desc.length >= 20;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 560, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 1 }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem' }}>
              {type === 'return' ? 'Return Request' : 'Replacement Request'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Order #{order._id.slice(-8).toUpperCase()} · Step {step} of 2
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step progress bar */}
        <div style={{ height: 3, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {step === 1 && (
            <>
              {/* Request type */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>What do you want to do?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { id: 'return', icon: PackageOpen, title: 'Return', desc: 'Send back & get a refund' },
                    { id: 'replacement', icon: RefreshCw, title: 'Replacement', desc: 'Swap for a working unit' },
                  ].map(opt => (
                    <button key={opt.id} type="button" onClick={() => setType(opt.id)}
                      style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${type === opt.id ? 'var(--accent-blue)' : 'var(--border)'}`, background: type === opt.id ? 'rgba(0,212,255,0.07)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ marginBottom: '0.3rem', color: type === opt.id ? 'var(--accent-blue)' : 'var(--text-muted)' }}><opt.icon size={24} /></div>
                      <p style={{ fontWeight: 700, color: type === opt.id ? 'var(--accent-blue)' : 'var(--text-primary)', fontSize: '0.95rem' }}>{opt.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items affected */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>Which items are affected? *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {order.items.map(item => (
                    <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${selectedItems.includes(item.name) ? 'var(--accent-blue)' : 'var(--border)'}`, background: selectedItems.includes(item.name) ? 'rgba(0,212,255,0.05)' : 'var(--bg-elevated)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedItems.includes(item.name)} onChange={() => toggleItem(item.name)} style={{ accentColor: 'var(--accent-blue)', width: 16, height: 16 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.variantLabel} · Qty {item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary reason */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Primary reason *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {REASONS.map(r => (
                    <button key={r} type="button" onClick={() => setReason(r)}
                      style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1.5px solid ${reason === r ? 'var(--accent-amber)' : 'var(--border)'}`, background: reason === r ? 'rgba(255,184,0,0.1)' : 'transparent', color: reason === r ? 'var(--accent-amber)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!canGoNext} className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.9rem' }}>
                Continue — Add Details →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary of step 1 */}
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span><strong>Type:</strong> {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <span><strong>Reason:</strong> {reason}</span>
                <span><strong>Items:</strong> {selectedItems.length}</span>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>Edit</button>
              </div>

              {/* Detailed description */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Describe the issue in detail *</label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Mention what happened, when you noticed it, and any steps you tried. Minimum 20 characters.</p>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="e.g. The Arduino Uno arrived and when I connected it, the power LED did not turn on. I tried multiple USB cables and computers but the board is not detected at all..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: desc.length < 20 ? 'var(--accent-red)' : 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                  {desc.length}/20 min characters
                </p>
              </div>

              {/* Preferred resolution */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Preferred resolution</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {RESOLUTIONS.map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${resolution === r ? 'var(--accent-green)' : 'var(--border)'}`, background: resolution === r ? 'rgba(16,185,129,0.06)' : 'transparent', cursor: 'pointer' }}>
                      <input type="radio" value={r} checked={resolution === r} onChange={() => setResolution(r)} style={{ accentColor: 'var(--accent-green)' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: resolution === r ? 600 : 400, color: resolution === r ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact & Bank (shown for return requests) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Contact phone</label>
                  <input type="tel" className="input" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">{type === 'return' ? 'UPI ID / Bank A/C (for refund)' : 'UPI ID (optional)'}</label>
                  <input type="text" className="input" placeholder="name@upi or last 4 digits" value={bank} onChange={e => setBank(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={!canSubmit || mutation.isPending}
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {mutation.isPending ? 'Submitting…' : `Submit ${type === 'return' ? 'Return' : 'Replacement'} Request`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────── */
const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [returnOrder,  setReturnOrder]  = useState(null);
  const [cancelOrder,  setCancelOrder]  = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data.data),
    enabled: !!user,
  });

  const { data: reviewedItems = [] } = useQuery({
    queryKey: ['my-reviewed-items'], // change queryKey to avoid cache conflicts with old format
    queryFn: () => api.get('/reviews/my-reviewed-items').then(r => r.data.data),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason, comment }) => api.post(`/orders/${orderId}/cancel`, { reason, comment }),
    onSuccess: () => { toast.success('Order cancelled.'); queryClient.invalidateQueries(['my-orders']); setCancelOrder(null); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Could not cancel order'),
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      <Helmet>
        <title>My Orders | SparkTech</title>
        <meta name="description" content="View and manage your SparkTech orders, track shipments, and request returns." />
      </Helmet>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Your Orders</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name || 'Customer'}. Here is your order history.</p>
      </div>

      {isLoading ? (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)' }} />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <PackageOpen size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No orders yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {orders.map((order, idx) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order Placed</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-blue)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Payment</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {order.paymentInfo?.method === 'cod' ? <><Truck size={14} /> COD</> : <><CreditCard size={14} /> Razorpay</>}
              </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order ID</p>
                      <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Timeline */}
                
                {/* Delivery Info Snippet */}
                {order.deliveryInfo?.estimatedDelivery && !['delivered', 'cancelled', 'returned'].includes(order.status) && (
                  <div style={{ padding: '0.75rem 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                    <Truck size={16} color="var(--accent-blue)" />
                    Arriving by {new Date(order.deliveryInfo.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {order.deliveryInfo.provider && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginLeft: '0.5rem' }}>via {order.deliveryInfo.provider}</span>}
                  </div>
                )}

                <div style={{ padding: '0.5rem 1.5rem 0' }}>
                  <OrderTimeline status={order.status} />
                </div>

                {/* Delivery Feedback Banner */}
                {order.status === 'delivered' && (
                  <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Star size={20} color="var(--accent-amber)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Your order was delivered!</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Please take a moment to rate the products below. Have an issue? You can submit feedback in the Support Portal.</p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.items.map(item => (
                    <div key={`${item.product}-${item.variant}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden' }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.variantLabel} × {item.quantity}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        {order.status === 'delivered' && (
                          reviewedItems.some(r => r.order === order._id && r.product === item.product) ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Reviewed
                            </span>
                          ) : (
                            <button onClick={() => setReviewProduct({ id: item.product, name: item.name, orderId: order._id })} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 99, background: 'rgba(255,184,0,0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(255,184,0,0.3)', cursor: 'pointer', fontWeight: 600 }}>
                              <Star size={12} /> Write Review
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return request card — only show when there is real data */}
                {order.returnRequest?.status && order.returnRequest?.reason && (() => {
                  const rr = order.returnRequest;
                  const typeName = rr.type ? (rr.type.charAt(0).toUpperCase() + rr.type.slice(1)) : 'Return';
                  const statusCfg = {
                    pending:      { label: 'Submitted',    color: 'var(--accent-amber)',  bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.3)',  step: 0 },
                    under_review: { label: 'Under Review', color: 'var(--accent-blue)',   bg: 'rgba(0,212,255,0.07)', border: 'rgba(0,212,255,0.25)', step: 1 },
                    approved:     { label: 'Approved',      color: 'var(--accent-green)',  bg: 'rgba(16,185,129,0.08)',border: 'rgba(16,185,129,0.3)', step: 2 },
                    rejected:     { label: 'Rejected',     color: 'var(--accent-red)',    bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.25)',step: 2 },
                    completed:    { label: 'Completed',    color: 'var(--text-muted)',    bg: 'var(--bg-secondary)',   border: 'var(--border)',        step: 3 },
                  };
                  const cfg = statusCfg[rr.status] || statusCfg.pending;
                  const rrSteps = ['Submitted','Under Review','Decision','Completed'];
                  return (
                    <div style={{ margin: '0 1.5rem 1rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.color }}>
                          {typeName} Request
                        </p>
                        <span style={{ padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                      {/* Mini tracker */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', marginBottom: '1rem' }}>
                        {/* background line */}
                        <div style={{ position: 'absolute', top: 10, left: '12.5%', right: '12.5%', height: 2, background: 'rgba(255,255,255,0.1)' }} />
                        {/* active fill */}
                        <div style={{ position: 'absolute', top: 10, left: '12.5%', height: 2, width: `${(cfg.step / (rrSteps.length-1)) * 75}%`, background: cfg.color, transition: 'width 0.4s' }} />
                        {rrSteps.map((s, i) => {
                          const done   = i < cfg.step;
                          const active = i === cfg.step;
                          const isRejected = rr.status === 'rejected' && i === 2;
                          return (
                            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: isRejected ? 'var(--accent-red)' : done || active ? cfg.color : 'var(--bg-elevated)', border: `2px solid ${isRejected ? 'var(--accent-red)' : done || active ? cfg.color : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                {isRejected ? '✕' : done ? '✓' : ''}
                              </div>
                              <p style={{ fontSize: '0.62rem', marginTop: '0.25rem', textAlign: 'center', color: active ? cfg.color : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>{s}</p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Details grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.5rem 1.5rem', fontSize: '0.82rem' }}>
                        {rr.reason && (<div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</span><p style={{ fontWeight: 500, marginTop: '0.1rem' }}>{rr.reason}</p></div>)}
                        {rr.preferredResolution && (<div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolution</span><p style={{ fontWeight: 500, marginTop: '0.1rem' }}>{rr.preferredResolution}</p></div>)}
                        {rr.itemsAffected?.length > 0 && (<div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</span><p style={{ fontWeight: 500, marginTop: '0.1rem' }}>{rr.itemsAffected.join(', ')}</p></div>)}
                        {rr.requestedAt && (<div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</span><p style={{ fontWeight: 500, marginTop: '0.1rem' }}>{new Date(rr.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>)}
                      </div>
                      {rr.description && (<div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.15)', borderLeft: `3px solid ${cfg.color}` }}><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rr.description}</p></div>)}
                      {rr.adminNote && (<div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Admin Note</p><p style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>{rr.adminNote}</p></div>)}
                    </div>
                  );
                })()}

                {/* Footer actions */}
                <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/products/${order.items[0]?.product}`)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      View Product <ChevronRight size={14} />
                    </button>
                    {/* Cancel order — only before shipping */}
                    {['pending','paid','processing'].includes(order.status) && (
                      <button
                        onClick={() => setCancelOrder(order)}
                        disabled={cancelMutation.isPending}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-red)', background: 'rgba(239,68,68,0.06)', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        <XCircle size={15} /> Cancel Order
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Track Package */}
                    {order.status === 'shipped' && order.deliveryInfo?.trackingUrl && (
                      <a 
                        href={order.deliveryInfo.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--bg-card)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <ExternalLink size={15} /> Track Package
                      </a>
                    )}
                    
                    {/* Invoice */}
                    <button onClick={() => setInvoiceOrder(order)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue)', background: 'rgba(0,212,255,0.06)', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 500 }}>
                      <FileText size={15} /> Invoice
                    </button>

                    {/* Return / Replace — always visible */}
                    {(!order.returnRequest?.reason || order.returnRequest.status === 'rejected') ? (
                      <button
                        onClick={() => {
                          if (order.status !== 'delivered') {
                            toast('Return/replacement is available after your order is delivered');
                            return;
                          }
                          setReturnOrder(order);
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.5rem 1rem', fontSize: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${order.status === 'delivered' ? 'var(--accent-amber)' : 'var(--border)'}`,
                          background: order.status === 'delivered' ? 'rgba(255,184,0,0.06)' : 'transparent',
                          color: order.status === 'delivered' ? 'var(--accent-amber)' : 'var(--text-muted)',
                          cursor: 'pointer', fontWeight: 500,
                          opacity: order.status === 'delivered' ? 1 : 0.6,
                        }}
                      >
                        <RotateCcw size={15} />
                        Return / Replace
                        {order.status !== 'delivered' && (
                          <span style={{ fontSize: '0.72rem', marginLeft: '0.2rem', opacity: 0.7 }}>(after delivery)</span>
                        )}
                      </button>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', opacity: 0.7 }}>
                        <RotateCcw size={14} /> Request Open
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoiceOrder && (
          <motion.div key="invoice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} isAdmin={false} />
          </motion.div>
        )}
        {returnOrder && (
          <motion.div key="return" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReturnModal order={returnOrder} onClose={() => setReturnOrder(null)} />
          </motion.div>
        )}
        {cancelOrder && (
          <motion.div key="cancel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CancelModal
              order={cancelOrder}
              onClose={() => setCancelOrder(null)}
              isPending={cancelMutation.isPending}
              onConfirm={({ reason, comment }) => cancelMutation.mutate({ orderId: cancelOrder._id, reason, comment })}
            />
          </motion.div>
        )}
        {reviewProduct && (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReviewModal product={reviewProduct} onClose={() => setReviewProduct(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;
