import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, AlertTriangle, Lightbulb, ThumbsUp, Send, Clock, CheckCircle2, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const TYPE_CONFIG = {
  feedback:   { label: 'General Feedback', icon: MessageSquare, color: 'var(--accent-blue)',  bg: 'rgba(59,130,246,0.08)',  desc: 'Share your thoughts about our platform or services' },
  complaint:  { label: 'Complaint',        icon: AlertTriangle,  color: 'var(--accent-red)',   bg: 'rgba(239,68,68,0.08)',   desc: 'Report an issue or problem you experienced' },
  suggestion: { label: 'Suggestion',       icon: Lightbulb,      color: 'var(--accent-amber)', bg: 'rgba(255,184,0,0.08)',   desc: 'Suggest improvements or new features' },
  compliment: { label: 'Compliment',       icon: ThumbsUp,       color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.08)',  desc: 'Let us know what we are doing well' },
};

const STATUS_CONFIG = {
  open:     { label: 'Open',     color: 'var(--accent-amber)', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'var(--accent-blue)',  icon: CheckCircle2 },
  resolved: { label: 'Resolved', color: 'var(--accent-green)', icon: CheckCircle2 },
};

const SupportPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch user's own feedback history (confidential)
  const { data: myFeedback = [], isLoading } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: () => api.get('/feedback/mine').then(r => r.data.data),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post('/feedback', { type: activeType, subject, message }),
    onSuccess: () => {
      toast.success('Your message has been submitted. We will get back to you soon.');
      setSubject(''); setMessage('');
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit. Please try again.'),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => api.post(`/feedback/${id}/reply`, { message }),
    onSuccess: () => {
      toast.success('Reply sent successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send reply.'),
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Helmet><title>Support - SparkTech</title></Helmet>
        <Shield size={48} style={{ color: 'var(--accent-blue)', marginBottom: '1.5rem', opacity: 0.5 }} />
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sign in Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please log in to access the support portal.</p>
        <a href="/login" className="btn btn-primary">Log In</a>
      </div>
    );
  }


  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: 900, margin: '0 auto', minHeight: '80vh' }}>
      <Helmet><title>Support Portal - SparkTech</title></Helmet>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: '#fff', marginBottom: '1rem' }}>
          <Shield size={28} />
        </div>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Support Portal</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          Your messages are <strong>confidential</strong> and go directly to our team. We'll respond as soon as possible.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Left: Submit Form */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send a Message</h2>

          {/* Type selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = activeType === key;
                return (
                  <button key={key} type="button" onClick={() => setActiveType(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? cfg.color : 'var(--border)'}`,
                      background: isActive ? cfg.bg : 'transparent',
                      color: isActive ? cfg.color : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={16} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Subject (optional)</label>
            <input type="text" className="input" placeholder="Brief summary of your message" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Message *</label>
            <textarea
              className="input"
              rows={5}
              placeholder={TYPE_CONFIG[activeType].desc + ' (min 10 characters)...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Confidentiality notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.25rem' }}>
            <Shield size={14} color="var(--accent-green)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>Your message is confidential. Only our support team can see it.</span>
          </div>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={message.length < 10 || submitMutation.isPending}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Send size={16} />
            {submitMutation.isPending ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Right: My History */}
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>My Messages</h2>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : myFeedback.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
              <MessageSquare size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No messages yet. Submit your first message above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {myFeedback.map(fb => {
                const cfg = TYPE_CONFIG[fb.type] || TYPE_CONFIG.feedback;
                const statusCfg = STATUS_CONFIG[fb.status] || STATUS_CONFIG.open;
                const Icon = cfg.icon;
                const StatusIcon = statusCfg.icon;
                const isExpanded = expandedId === fb._id;

                return (
                  <div key={fb._id}
                    style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {/* Summary row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : fb._id)}
                      style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fb.ticketId && <span style={{ color: 'var(--accent-blue)', marginRight: '0.5rem', fontFamily: 'monospace' }}>[{fb.ticketId}]</span>}
                          {fb.subject || fb.message.slice(0, 50) + (fb.message.length > 50 ? '...' : '')}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, color: statusCfg.color, flexShrink: 0 }}>
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </span>
                      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 0' }}>
                              {/* Original Message */}
                              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'var(--bg-secondary)', borderRadius: '1rem 1rem 1rem 0', padding: '0.85rem 1.15rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>You • {new Date(fb.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                {fb.message}
                              </div>

                              {/* Legacy Admin Note (if any and not in replies) */}
                              {fb.adminNote && (!fb.replies || fb.replies.length === 0) && (
                                <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'rgba(59,130,246,0.1)', borderRadius: '1rem 1rem 0 1rem', padding: '0.85rem 1.15rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--accent-blue)' }}>
                                  <p style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', opacity: 0.7, marginBottom: '0.3rem', fontWeight: 600 }}>SparkTech Support • {fb.adminRespondedAt ? new Date(fb.adminRespondedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                                  {fb.adminNote}
                                </div>
                              )}

                              {/* Threaded Replies */}
                              {fb.replies?.map((reply, idx) => {
                                const isUser = reply.sender === 'user';
                                return (
                                  <div key={idx} style={{ 
                                    alignSelf: isUser ? 'flex-start' : 'flex-end', 
                                    maxWidth: '85%', 
                                    background: isUser ? 'var(--bg-secondary)' : 'rgba(59,130,246,0.1)', 
                                    borderRadius: isUser ? '1rem 1rem 1rem 0' : '1rem 1rem 0 1rem', 
                                    padding: '0.85rem 1.15rem', 
                                    fontSize: '0.88rem', 
                                    lineHeight: 1.6, 
                                    color: isUser ? 'var(--text-secondary)' : 'var(--text-primary)' 
                                  }}>
                                    <p style={{ fontSize: '0.72rem', color: isUser ? 'var(--text-muted)' : 'var(--accent-blue)', opacity: isUser ? 1 : 0.7, marginBottom: '0.3rem', fontWeight: 600 }}>
                                      {isUser ? 'You' : 'SparkTech Support'} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    {reply.message}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reply Input Form */}
                            {fb.status !== 'resolved' ? (
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const msg = e.target.elements.replyMsg.value.trim();
                                if (msg) {
                                  replyMutation.mutate({ id: fb._id, message: msg });
                                  e.target.reset();
                                }
                              }} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input name="replyMsg" type="text" className="input" placeholder="Type a reply..." style={{ flex: 1, fontSize: '0.85rem' }} disabled={replyMutation.isPending} />
                                <button type="submit" className="btn btn-primary" disabled={replyMutation.isPending} style={{ padding: '0.5rem 1rem' }}>
                                  <Send size={16} />
                                </button>
                              </form>
                            ) : (
                              <div style={{ padding: '0.6rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                This ticket has been resolved and closed.
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
      </div>
    </div>
  );
};

export default SupportPage;
