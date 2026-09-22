import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Phone, MapPin, Mail, Instagram, Facebook, Linkedin, Youtube, MessageCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Subscribed to SparkTech engineering updates!');
    setEmail('');
  };

  return (
    <footer style={{ marginTop: 'auto' }}>
      {/* 1. Newsletter Banner with Dark Hardware Styling (Matching Image 1) */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0B1120 0%, #151D30 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          paddingBlock: '3.5rem 3.75rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.35rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            Subscribe to our newsletter
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '1.75rem' }}>
            Stay informed for Our New Products, Robotics Kits and Engineering Services
          </p>

          {subscribed ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#A7F3D0', padding: '0.6rem 1.4rem', borderRadius: '6px' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Thank you for subscribing!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: 'flex',
                gap: '0.5rem',
                maxWidth: 480,
                margin: '0 auto',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                style={{
                  flex: '1 1 260px',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. Main 4-Column Professional Footer */}
      <div style={{ background: '#080C14', color: '#E2E8F0', paddingBlock: '3.5rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2.5rem',
              marginBottom: '3rem',
            }}
          >
            {/* Column 1: Brand & Bio */}
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: 'var(--accent-blue)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={18} color="#fff" />
                </div>
                <div>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                    SPARKTECH
                  </span>
                </div>
              </Link>

              <p style={{ color: '#94A3B8', fontSize: '0.84rem', lineHeight: 1.65, marginBottom: '1.5rem', maxWidth: 260 }}>
                Transforming Vision Into Robotics Reality. Supplying verified microcontrollers, robotics sensors, and rapid prototyping services across India.
              </p>

              {/* Social Icons Row matching Image 1 */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                  { icon: MessageCircle, href: 'https://whatsapp.com', label: 'WhatsApp' },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#CBD5E1',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#CBD5E1';
                      }}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2: MENU */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                MENU
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  ['Home', '/'],
                  ['Shop', '/shop'],
                  ['Services', '/services'],
                  ['About Us', '/about'],
                  ['Contact Us', '/support'],
                ].map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: POLICIES */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                POLICIES
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  ['Terms & conditions', '/terms'],
                  ['Privacy Policy', '/privacy'],
                  ['Shipping & replacement', '/shipping'],
                  ['GST Invoices & Billing', '/billing'],
                  ['Careers', '/careers'],
                  ['FAQ', '/faq'],
                ].map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: CONTACT */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                CONTACT
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Phone size={16} color="#60A5FA" style={{ marginTop: 3, flexShrink: 0 }} />
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    <div>+91 98765 43210</div>
                    <div>+91 98765 43211</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MapPin size={16} color="#60A5FA" style={{ marginTop: 3, flexShrink: 0 }} />
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    Shop No : 04, Tech Industrial Park, Hinjewadi Phase 1, Pune, Maharashtra 411057
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Mail size={16} color="#60A5FA" style={{ flexShrink: 0 }} />
                  <a
                    href="mailto:sales@sparktech.in"
                    style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                  >
                    sales@sparktech.in
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: '#64748B', fontSize: '0.8rem', margin: 0 }}>
              © Copyright {new Date().getFullYear()} SparkTech Commerce. All Rights Reserved.
            </p>
            <p style={{ color: '#475569', fontSize: '0.78rem', margin: 0 }}>
              Official Distributor of Robotics &amp; Electronic Components
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
