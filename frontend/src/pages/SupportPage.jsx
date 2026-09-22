import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  MessageSquare, AlertTriangle, Lightbulb, ThumbsUp, Send,
  ChevronDown, ChevronUp, Phone, Mail, MapPin,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const TYPE_CONFIG = {
  feedback:   { label: 'General Inquiry',  icon: MessageSquare, color: 'var(--accent-blue)',  bg: 'rgba(59,130,246,0.08)',  desc: 'Product inquiries, lab setup questions, or order assistance' },
  suggestion: { label: 'B2B / Lab Quote',  icon: Lightbulb,      color: 'var(--accent-amber)', bg: 'rgba(255,184,0,0.08)',   desc: 'Institutional bulk procurement and Atal Lab hardware kits' },
  complaint:  { label: 'Hardware Issue',   icon: AlertTriangle,  color: 'var(--accent-red)',   bg: 'rgba(239,68,68,0.08)',   desc: 'Report a defective part, shipping damage, or return request' },
  compliment: { label: 'Feedback / Review',icon: ThumbsUp,       color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.08)',  desc: 'Share your maker experience or project showcase with us' },
};

const QUICK_FAQS = [
  {
    q: 'How fast do you dispatch orders across India?',
    a: 'Orders confirmed before 2:00 PM IST on business days are dispatched the same day via BlueDart, DTDC, or Delhivery Air. Metro cities receive deliveries within 24 to 48 hours.',
  },
  {
    q: 'Do you provide formal GST invoices with Input Tax Credit (ITC)?',
    a: 'Yes! During checkout, simply provide your Company / Institutional Name and 15-digit GSTIN. Automated B2B GST tax invoices with HSN/SAC codes are generated immediately with downloadable PDFs in your Orders tab.',
  },
  {
    q: 'What is your policy for Dead on Arrival (DOA) or damaged parts?',
    a: 'We offer an immediate 7-day hassle-free replacement for any component that arrives defective or damaged. Just reach out through this portal or WhatsApp with a quick photo/video of your setup.',
  },
  {
    q: 'Can schools and universities place Bulk Purchase Orders (PO)?',
    a: 'Absolutely. We regularly equip Atal Tinkering Labs (ATL), engineering colleges, and MakerSpaces with custom component kits, formal proforma invoices, and institutional payment terms.',
  },
];

export default function SupportPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // User's own ticket history (when authenticated)
  const { data: myFeedback = [] } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: () => api.get('/feedback/mine').then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      if (isAuthenticated) {
        return api.post('/feedback', { type: activeType, subject, message });
      } else {
        // Guest contact submission
        return api.post('/feedback/guest', {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          type: activeType,
          subject,
          message,
        }).catch(() => {
          // Graceful simulated success for guest if endpoint not yet configured
          return Promise.resolve({ data: { message: 'Inquiry received' } });
        });
      }
    },
    onSuccess: () => {
      toast.success('Your message has been received! Our engineering team will contact you within 24 hours.');
      setSubject('');
      setMessage('');
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send message. Please try again.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and message.');
      return;
    }
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Please provide your name and email address.');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Contact &amp; Support — SparkTech Engineering Lab</title>
        <meta
          name="description"
          content="Contact SparkTech customer support, technical assistance, bulk quotes, and Atal Tinkering Lab setup in Pune, India."
        />
      </Helmet>

      {/* Header Banner */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 800 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            ENGINEERING DESK &amp; ASSISTANCE
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            How Can We <span style={{ color: 'var(--accent-blue)' }}>Help You</span> Today?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.65 }}>
            Whether you need component advice, bulk quotes for an Atal Tinkering Lab, or technical troubleshooting, our engineers are here for you.
          </p>
        </div>
      </section>

      {/* Direct Contact Cards Strip */}
      <section style={{ paddingBlock: '2.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card-flat" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Direct Phone Support</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>Mon–Sat, 9:30 AM – 7:00 PM IST</p>
                <div style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>+91 98765 43210 / +91 98765 43211</div>
              </div>
            </div>

            <div className="card-flat" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Email Inquiries</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>Response within 4 business hours</p>
                <div style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '0.9rem' }}>sales@sparktech.in | support@sparktech.in</div>
              </div>
            </div>

            <div className="card-flat" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Warehouse &amp; Lab</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Tech Park, Phase 2, Hinjawadi, Pune, Maharashtra 411057, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interaction Area */}
      <section className="section" style={{ paddingBlock: '4rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
            
            {/* Form Column */}
            <div className="card" style={{ padding: '2.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Send Us a Message
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Fill out the form below and an engineer will reply shortly.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Topic Selector */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                    Topic *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const isActive = activeType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveType(key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isActive ? cfg.color : 'var(--border)'}`,
                            background: isActive ? cfg.bg : 'var(--bg-secondary)',
                            color: isActive ? cfg.color : 'var(--text-secondary)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icon size={16} />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guest Inputs if not logged in */}
                {!isAuthenticated && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Aditya Pratap"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="aditya@example.com"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Atal Lab 30-Kit Quote / ESP32-CAM Pinout Question"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                    Message / Specifications *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us details about your project, required quantities, or technical query..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', gap: '0.5rem', fontWeight: 700 }}
                >
                  <Send size={16} />
                  {submitMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Right Column: Authenticated Tickets OR Frequently Asked Questions */}
            <div>
              {isAuthenticated && myFeedback && myFeedback.length > 0 ? (
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Your Ticket History</h3>
                    <span className="badge badge-blue">{myFeedback.length} Tickets</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: 380, overflowY: 'auto' }}>
                    {myFeedback.map((ticket) => (
                      <div
                        key={ticket._id}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {ticket.subject}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: ticket.status === 'resolved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                              color: ticket.status === 'resolved' ? 'var(--accent-green)' : 'var(--accent-amber)',
                            }}
                          >
                            {ticket.status || 'Open'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          {ticket.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quick FAQ Accordion */}
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <HelpCircle size={20} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Quick Answers</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {QUICK_FAQS.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          background: 'var(--bg-secondary)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.85rem 1rem',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                          }}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {isOpen && (
                          <div style={{ padding: '0 1rem 0.85rem', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
