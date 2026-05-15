import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageOpen, Clock, CheckCircle2, Truck, XCircle,
  X, CreditCard, Star, ChevronDown, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import InvoiceModal from '../components/InvoiceModal';
import OrderTimeline from '../components/OrderTimeline';

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
            <label className="form-label">Review Title *</label>
            <input type="text" className="input" placeholder="Summarize your experience" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
            <p style={{ fontSize: '0.75rem', color: title.length < 2 ? 'var(--accent-red)' : 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
              {title.length}/100 chars (min 2)
            </p>
          </div>

          <div>
            <label className="form-label">Review *</label>
            <textarea className="input" rows={4} placeholder="What did you like or dislike? How did it fit?" value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} style={{ resize: 'vertical' }} />
            <p style={{ fontSize: '0.75rem', color: comment.length < 10 ? 'var(--accent-red)' : 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
              {comment.length}/2000 chars (min 10)
            </p>
          </div>

          <button onClick={() => mutation.mutate()} disabled={!rating || title.length < 2 || comment.length < 10 || mutation.isPending} className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem' }}>
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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['my-orders', searchTerm, page],
    queryFn: () => api.get('/orders/my', { params: { search: searchTerm, page, limit: 10 } }).then(r => r.data.data),
    enabled: !!user,
    keepPreviousData: true
  });

  const orders = pageData?.orders || [];
  const pagination = pageData?.pagination;

  const { data: reviewedItems = [] } = useQuery({
    queryKey: ['my-reviewed-items'], // change queryKey to avoid cache conflicts with old format
    queryFn: () => api.get('/reviews/my-reviewed-items').then(r => r.data.data),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason, comment }) => api.post(`/orders/${orderId}/cancel`, { reason, comment }),
    onSuccess: () => {
      toast.success('Order cancelled.');
      queryClient.invalidateQueries(['my-orders']);
      setCancelOrder(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not cancel order'),
  });

  const filteredOrders = (orders || []).filter((order) => {
    // Tab filter
    if (activeTab === 'ongoing' && ['delivered', 'cancelled', 'refunded', 'returned'].includes(order.status)) return false;
    if (activeTab === 'delivered' && order.status !== 'delivered') return false;
    if (activeTab === 'cancelled' && !['cancelled', 'refunded'].includes(order.status)) return false;

    // Search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const matchesId = order._id.toLowerCase().includes(s);
      const matchesProduct = order.items.some((item) => item.name.toLowerCase().includes(s));
      return matchesId || matchesProduct;
    }
    return true;
  });

  const TABS = [
    { id: 'all', label: 'All Orders' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      <Helmet>
        <title>My Orders | SparkTech</title>
        <meta name="description" content="View and manage your SparkTech orders, track shipments, and request returns." />
      </Helmet>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.4rem' }}>Your Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track, manage and review your purchases.</p>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Clock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by product or Order ID..." 
            className="input" 
            style={{ paddingLeft: '2.5rem', height: '2.5rem', fontSize: '0.9rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem', gap: '2rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.95rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)' }} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageOpen size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.3rem' }}>{searchTerm ? 'No matching orders' : 'No orders found'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{searchTerm ? 'Try a different search term or check other tabs.' : 'You haven\'t placed any orders in this category yet.'}</p>
          </div>
          <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Browse Shop</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredOrders.map((order, idx) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

                {/* Card Header — Amazon Style */}
                <div style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Order Placed</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Total</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Ship To</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }} title={order.shippingAddress?.address}>
                        {user?.name} <ChevronDown size={14} />
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Order # {order._id.slice(-8).toUpperCase()}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        {expandedOrderId === order._id ? 'Hide Details' : 'View order details'}
                      </button>
                      <span style={{ color: 'var(--border)' }}>|</span>
                      <button onClick={() => setInvoiceOrder(order)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Invoice</button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    {/* Status Text */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        {order.status === 'delivered' ? (
                          <><CheckCircle2 size={20} color="var(--accent-green)" /> Delivered {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</>
                        ) : order.status === 'cancelled' ? (
                          <><XCircle size={20} color="var(--accent-red)" /> Cancelled</>
                        ) : (
                          <><Truck size={20} color="var(--accent-blue)" /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</>
                        )}
                      </h3>
                      {order.deliveryInfo?.estimatedDelivery && order.status !== 'delivered' && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated delivery: {new Date(order.deliveryInfo.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      )}
                    </div>

                    {/* Items List (Simplified) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: 70, height: 70, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Link to={`/shop/${item.product}`} style={{ fontWeight: 600, color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                              {item.name}
                            </Link>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.variantLabel} · Qty {item.quantity}</p>
                            
                            {order.status === 'delivered' && (
                              <div style={{ marginTop: '0.5rem' }}>
                                {reviewedItems.some(r => r.order === order._id && r.product === item.product) ? (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle2 size={12} /> You reviewed this item
                                  </span>
                                ) : (
                                  <button onClick={() => setReviewProduct({ id: item.product, name: item.name, orderId: order._id })} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                                    <Star size={12} /> Write a product review
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 200 }}>
                    {order.status === 'shipped' && order.deliveryInfo?.trackingUrl && (
                      <a href={order.deliveryInfo.trackingUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                        Track package
                      </a>
                    )}
                    {order.status === 'delivered' && (
                      <button onClick={() => setReturnOrder(order)} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                        Return or replace items
                      </button>
                    )}
                    {['pending', 'paid', 'processing'].includes(order.status) && (
                      <button onClick={() => setCancelOrder(order)} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: '0.85rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                        Cancel order
                      </button>
                    )}
                    <button onClick={() => navigate(`/shop/${order.items[0]?.product}`)} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                      Buy it again
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                <AnimatePresence>
                  {expandedOrderId === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}
                    >
                      <div style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Order Progress</h4>
                        <div style={{ marginBottom: '2rem' }}>
                          <OrderTimeline status={order.status} />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shipping Address</h4>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                              <p style={{ fontWeight: 600 }}>{user?.name}</p>
                              <p>{order.shippingAddress?.address}</p>
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                              <p>Phone: {order.shippingAddress?.phone}</p>
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Payment Method</h4>
                            <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {order.paymentInfo?.method === 'cod' ? <><Truck size={16} /> Cash on Delivery</> : <><CreditCard size={16} /> Online (Razorpay)</>}
                            </p>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order Summary</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Items:</span>
                                <span>₹{(order.totalAmount - (order.shippingPrice || 0)).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
                                <span>{order.shippingPrice > 0 ? `₹${order.shippingPrice}` : 'FREE'}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                <span>Grand Total:</span>
                                <span style={{ color: 'var(--accent-blue)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--text-muted)' }}>…</span>}
                <button className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setPage(p); window.scrollTo(0,0); }} style={{ minWidth: 40 }}>
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button className="btn btn-outline" disabled={page >= pagination.totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}>
            <ChevronRight size={16} />
          </button>
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
