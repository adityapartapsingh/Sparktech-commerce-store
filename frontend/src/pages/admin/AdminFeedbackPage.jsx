import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, ChevronDown, ChevronUp, Star, Save, CheckCircle2, Clock, AlertTriangle, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const TYPE_CONFIG = {
  complaint:  { label: 'Complaint',  color: 'var(--accent-red)',    icon: AlertTriangle, bg: 'rgba(239,68,68,0.08)' },
  suggestion: { label: 'Suggestion', color: 'var(--accent-amber)',  icon: MessageSquare, bg: 'rgba(255,184,0,0.08)' },
  feedback:   { label: 'Feedback',   color: 'var(--accent-blue)',   icon: MessageSquare, bg: 'rgba(59,130,246,0.08)' },
  compliment: { label: 'Compliment', color: 'var(--accent-green)',  icon: ThumbsUp,      bg: 'rgba(16,185,129,0.08)' },
};

const STATUS_CONFIG = {
  open:     { label: 'Open',     color: 'var(--accent-amber)', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'var(--accent-blue)',  icon: CheckCircle2 },
  resolved: { label: 'Resolved', color: 'var(--accent-green)', icon: CheckCircle2 },
};

const AdminFeedbackPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [page, setPage] = useState(1);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-feedback', typeFilter, statusFilter, page],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/feedback', { params });
      return res.data.data;
    },
    enabled: !!user,
    keepPreviousData: true
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }) => api.patch(`/admin/feedback/${id}`, { status, adminNote }),
    onSuccess: () => {
      toast.success('Feedback updated');
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const feedbacks = pageData?.feedbacks || [];
  const filtered = feedbacks.filter(fb => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      fb.user?.name?.toLowerCase().includes(term) ||
      fb.user?.email?.toLowerCase().includes(term) ||
      fb.product?.name?.toLowerCase().includes(term) ||
      fb.message?.toLowerCase().includes(term)
    );
  });

  const handleExpand = (fb) => {
    if (expandedId === fb._id) {
      setExpandedId(null);
    } else {
      setExpandedId(fb._id);
      setAdminNote(fb.adminNote || '');
    }
  };

  const statusCounts = {
    all: feedbacks.length,
    open: feedbacks.filter(f => f.status === 'open').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Customer Feedback</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage complaints, suggestions, and feedback from customers.</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: '', label: `All (${statusCounts.all})` },
            { key: 'open', label: `Open (${statusCounts.open})` },
            { key: 'reviewed', label: `Reviewed (${statusCounts.reviewed})` },
            { key: 'resolved', label: `Resolved (${statusCounts.resolved})` },
          ].map(s => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)}
              style={{ padding: '0.4rem 0.85rem', borderRadius: 99, border: `1.5px solid ${statusFilter === s.key ? 'var(--accent-blue)' : 'var(--border)'}`, background: statusFilter === s.key ? 'rgba(59,130,246,0.1)' : 'transparent', color: statusFilter === s.key ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="input" style={{ width: 160, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
          <option value="">All Types</option>
          <option value="complaint">Complaints</option>
          <option value="suggestion">Suggestions</option>
          <option value="feedback">Feedback</option>
          <option value="compliment">Compliments</option>
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="input" placeholder="Search by customer, product, or message..."
            style={{ paddingLeft: '2.25rem' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading feedback...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No feedback found</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 90px 80px 100px 40px', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <span>Customer</span>
              <span>Product</span>
              <span>Type</span>
              <span>Rating</span>
              <span>Status</span>
              <span>Date</span>
              <span></span>
            </div>

            {/* Rows */}
            {filtered.map(fb => {
              const typeConf = TYPE_CONFIG[fb.type] || TYPE_CONFIG.feedback;
              const statusConf = STATUS_CONFIG[fb.status] || STATUS_CONFIG.open;
              const TypeIcon = typeConf.icon;
              const isExpanded = expandedId === fb._id;

              return (
                <div key={fb._id}>
                  <div onClick={() => handleExpand(fb)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 90px 80px 100px 40px', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Customer */}
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {fb.ticketId && <span style={{ color: 'var(--accent-purple)', marginRight: '0.4rem', fontFamily: 'monospace' }}>[{fb.ticketId}]</span>}
                        {fb.user?.name || 'Unknown'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{fb.user?.email}</p>
                    </div>
                    {/* Product */}
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fb.product?.name || 'Deleted Product'}</p>
                    </div>
                    {/* Type */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, color: typeConf.color, background: typeConf.bg, width: 'fit-content' }}>
                      <TypeIcon size={11} />{typeConf.label}
                    </span>
                    {/* Rating */}
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {fb.rating ? [1,2,3,4,5].map(n => (
                        <Star key={n} size={12} fill={n <= fb.rating ? 'var(--accent-amber)' : 'transparent'} color={n <= fb.rating ? 'var(--accent-amber)' : 'var(--border)'} />
                      )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>N/A</span>}
                    </div>
                    {/* Status */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600, color: statusConf.color }}>
                      <statusConf.icon size={12} />{statusConf.label}
                    </span>
                    {/* Date */}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(fb.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                    {/* Expand */}
                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key={`detail-${fb._id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
                      >
                        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)' }}>
                          {/* Threaded Replies View */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>Conversation History</label>
                            
                            {/* Original Message */}
                            <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'var(--bg-card)', borderRadius: '1rem 1rem 1rem 0', padding: '0.85rem 1.15rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', border: '1px solid var(--border)', borderLeft: `3px solid ${typeConf.color}` }}>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Customer • {new Date(fb.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              {fb.message}
                            </div>

                            {/* Legacy Admin Note (if any and not in replies) */}
                            {fb.adminNote && (!fb.replies || fb.replies.length === 0) && (
                              <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'rgba(16,185,129,0.06)', borderRadius: '1rem 1rem 0 1rem', padding: '0.85rem 1.15rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--accent-green)', opacity: 0.8, marginBottom: '0.3rem', fontWeight: 600 }}>Admin Note (Legacy) • {fb.adminRespondedAt ? new Date(fb.adminRespondedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                                {fb.adminNote}
                              </div>
                            )}

                            {/* Threaded Replies */}
                            {fb.replies?.map((reply, idx) => {
                              const isAdmin = reply.sender === 'admin';
                              return (
                                <div key={idx} style={{ 
                                  alignSelf: isAdmin ? 'flex-end' : 'flex-start', 
                                  maxWidth: '85%', 
                                  background: isAdmin ? 'rgba(139,92,246,0.06)' : 'var(--bg-card)', 
                                  borderRadius: isAdmin ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0', 
                                  padding: '0.85rem 1.15rem', 
                                  fontSize: '0.88rem', 
                                  lineHeight: 1.6, 
                                  color: 'var(--text-primary)',
                                  border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.2)' : 'var(--border)'}`
                                }}>
                                  <p style={{ fontSize: '0.72rem', color: isAdmin ? 'var(--accent-purple)' : 'var(--text-muted)', opacity: 0.8, marginBottom: '0.3rem', fontWeight: 600 }}>
                                    {isAdmin ? `Admin (${reply.senderName || 'SparkTech'})` : 'Customer'} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                  {reply.message}
                                </div>
                              );
                            })}
                          </div>

                          {/* Admin controls */}
                          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '1rem', alignItems: 'end' }}>
                            {/* Status dropdown */}
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>Update Status</label>
                              <select
                                className="input"
                                value={fb.status}
                                onChange={e => updateMutation.mutate({ id: fb._id, status: e.target.value })}
                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                                <option value="open">Open</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>

                            {/* Admin reply input */}
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>Send Reply</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Type a response to the customer..."
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                style={{ fontSize: '0.85rem' }}
                              />
                            </div>

                            {/* Send button */}
                            <button
                              onClick={() => {
                                updateMutation.mutate({ id: fb._id, adminNote });
                                setAdminNote('');
                              }}
                              disabled={updateMutation.isPending || !adminNote.trim()}
                              className="btn btn-primary"
                              style={{ height: 42, gap: '0.4rem' }}
                            >
                              <Save size={15} />
                              {updateMutation.isPending ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pageData?.pagination && pageData.pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.5rem' }}>
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: pageData.pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pageData.pagination.totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--text-muted)' }}>…</span>}
                  <button className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)} style={{ minWidth: 40, height: 40, padding: 0 }}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button className="btn btn-outline" disabled={page >= pageData.pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.5rem' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
