import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ChevronDown, ChevronUp, Trash2, Save, MessageSquare, ShieldCheck, Package, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low',  label: 'Lowest Rated' },
];

const RatingStars = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '1px' }}>
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={size}
        fill={n <= rating ? 'var(--accent-amber)' : 'transparent'}
        color={n <= rating ? 'var(--accent-amber)' : 'var(--border)'}
      />
    ))}
  </div>
);

const RatingBar = ({ rating, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
      <span style={{ width: 14, textAlign: 'right', fontWeight: 600 }}>{rating}</span>
      <Star size={12} fill="var(--accent-amber)" color="var(--accent-amber)" />
      <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 99,
            background: rating >= 4 ? 'var(--accent-green)' : rating === 3 ? 'var(--accent-amber)' : 'var(--accent-red)',
          }}
        />
      </div>
      <span style={{ width: 30, color: 'var(--text-muted)', fontSize: '0.78rem' }}>{count}</span>
    </div>
  );
};

const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [page, setPage] = useState(1);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-reviews', ratingFilter, sortBy, page],
    queryFn: async () => {
      const params = { limit: 30, page, sort: sortBy };
      if (ratingFilter) params.rating = ratingFilter;
      const res = await api.get('/admin/reviews', { params });
      return res.data.data;
    }
  });

  const remarkMutation = useMutation({
    mutationFn: ({ id, adminRemarks }) => api.patch(`/reviews/${id}/remark`, { adminRemarks }),
    onSuccess: () => {
      toast.success('Admin remarks saved');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save remarks'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const reviews = pageData?.reviews || [];
  const pagination = pageData?.pagination || {};
  const ratingStats = pageData?.ratingStats || [];

  // Build a map {5: count, 4: count, ...}
  const ratingMap = {};
  let totalReviews = 0;
  ratingStats.forEach(r => { ratingMap[r._id] = r.count; totalReviews += r.count; });

  // Client-side text search
  const filtered = reviews.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(term) ||
      r.user?.email?.toLowerCase().includes(term) ||
      r.product?.name?.toLowerCase().includes(term) ||
      r.title?.toLowerCase().includes(term) ||
      r.comment?.toLowerCase().includes(term)
    );
  });

  const handleExpand = (review) => {
    if (expandedId === review._id) {
      setExpandedId(null);
    } else {
      setExpandedId(review._id);
      setAdminRemarks(review.adminRemarks || '');
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Compute average
  const avgRating = totalReviews > 0
    ? (ratingStats.reduce((sum, r) => sum + (r._id * r.count), 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Product Reviews</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor, moderate, and respond to customer product reviews.</p>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Rating Distribution Card */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Rating Distribution</h3>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 70 }}>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--accent-amber)' }}>{avgRating}</p>
              <RatingStars rating={Math.round(Number(avgRating))} size={13} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{totalReviews} reviews</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[5,4,3,2,1].map(r => (
                <RatingBar key={r} rating={r} count={ratingMap[r] || 0} total={totalReviews} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Total Reviews', value: totalReviews, color: 'var(--accent-blue)', icon: MessageSquare },
            { label: 'Verified', value: reviews.filter(r => r.verified).length, color: 'var(--accent-green)', icon: ShieldCheck },
            { label: '5-Star', value: ratingMap[5] || 0, color: 'var(--accent-amber)', icon: Star },
            { label: '1-Star', value: ratingMap[1] || 0, color: 'var(--accent-red)', icon: Star },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                <s.icon size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</p>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Rating pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: '', label: 'All' },
            { key: '5', label: '5★' },
            { key: '4', label: '4★' },
            { key: '3', label: '3★' },
            { key: '2', label: '2★' },
            { key: '1', label: '1★' },
          ].map(s => (
            <button key={s.key} onClick={() => { setRatingFilter(s.key); setPage(1); }}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: 99,
                border: `1.5px solid ${ratingFilter === s.key ? 'var(--accent-amber)' : 'var(--border)'}`,
                background: ratingFilter === s.key ? 'rgba(255,184,0,0.1)' : 'transparent',
                color: ratingFilter === s.key ? 'var(--accent-amber)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                transition: 'all 0.15s',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
          className="input" style={{ width: 170, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="input" placeholder="Search by customer, product, or review text..."
            style={{ paddingLeft: '2.25rem' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Reviews Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)', margin: '0 auto 0.75rem' }}
            />
            Loading reviews...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No reviews found</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 100px 40px',
              padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)',
              fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontWeight: 600,
            }}>
              <span>Customer</span>
              <span>Product</span>
              <span>Rating</span>
              <span>Verified</span>
              <span>Date</span>
              <span></span>
            </div>

            {/* Rows */}
            {filtered.map(review => {
              const isExpanded = expandedId === review._id;
              return (
                <div key={review._id}>
                  <div onClick={() => handleExpand(review)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 100px 40px',
                      padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Customer */}
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user?.name || 'Deleted User'}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{review.user?.email}</p>
                    </div>
                    {/* Product */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {review.product?.images?.[0] ? (
                        <img src={review.product.images[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={14} color="var(--text-muted)" />
                        </div>
                      )}
                      <p style={{ fontWeight: 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.product?.name || 'Deleted Product'}
                      </p>
                    </div>
                    {/* Rating */}
                    <RatingStars rating={review.rating} size={13} />
                    {/* Verified */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {review.verified ? (
                        <>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-green)' }}>
                            <ShieldCheck size={13} /> Verified
                          </span>
                          {review.order && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                              #{review.order.slice(-8).toUpperCase()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                    {/* Date */}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                    {/* Expand */}
                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key={`detail-${review._id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
                      >
                        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)' }}>
                          {/* Review Title & Comment */}
                          <div style={{ marginBottom: '1.25rem' }}>
                            {review.title && (
                              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                "{review.title}"
                              </h4>
                            )}
                            <div style={{
                              padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)', borderLeft: '3px solid var(--accent-amber)',
                              fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                            }}>
                              {review.comment || 'No comment provided.'}
                            </div>
                          </div>

                          {/* Admin Remarks Section */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>
                                Admin Remarks (visible to customers)
                              </label>
                              <input
                                type="text" className="input"
                                placeholder="Add a public response to this review..."
                                value={adminRemarks}
                                onChange={e => setAdminRemarks(e.target.value)}
                                style={{ fontSize: '0.85rem' }}
                              />
                            </div>
                            <button
                              onClick={() => remarkMutation.mutate({ id: review._id, adminRemarks })}
                              disabled={remarkMutation.isPending}
                              className="btn btn-primary"
                              style={{ height: 42, gap: '0.4rem' }}
                            >
                              <Save size={15} />
                              {remarkMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={(e) => handleDelete(review._id, e)}
                              disabled={deleteMutation.isPending}
                              className="btn"
                              style={{
                                height: 42, gap: '0.4rem', color: 'var(--accent-red)',
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                              }}
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>

                          {/* Existing remarks */}
                          {review.adminRemarks && (
                            <div style={{
                              marginTop: '1rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
                            }}>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                                Current Remarks {review.remarkedBy?.name ? `by ${review.remarkedBy.name}` : ''}
                                {review.remarkedAt && ` • ${new Date(review.remarkedAt).toLocaleDateString('en-IN')}`}
                              </p>
                              <p style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{review.adminRemarks}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn"
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', opacity: page <= 1 ? 0.4 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} reviews)
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="btn"
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', opacity: page >= pagination.totalPages ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
