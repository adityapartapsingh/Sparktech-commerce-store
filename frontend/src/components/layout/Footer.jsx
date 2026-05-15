import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', marginTop: 'auto', paddingBlock: '2.5rem 1.5rem' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 30, height: 30,
              background: 'var(--accent-blue)',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
              SparkTech
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 240 }}>
            India's trusted source for electronic and robotic components. Quality parts, fast shipping.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Shop</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              ['All Shop', '/shop'],
              ['Microcontrollers', '/shop?category=microcontrollers'],
              ['Sensors', '/shop?category=sensors'],
              ['Motors', '/shop?category=motors'],
              ['Featured', '/shop?featured=true'],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Account</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              ['My Orders', '/orders'],
              ['Profile', '/profile'],
              ['Wishlist', '/wishlist'],
              ['Cart', '/cart'],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>
              <a href="mailto:support@SparkTech.com" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
                support@SparkTech.com
              </a>
            </li>
            <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mon–Sat, 10 AM – 7 PM</li>
          </ul>
          {/* Payment methods */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>We accept</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['UPI', 'Cards', 'NetBanking', 'COD'].map((m) => (
                <span key={m} style={{
                  fontSize: '0.7rem', padding: '0.15rem 0.45rem',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
                }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} SparkTech. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {[
            { icon: <Github size={16} />, href: '#' },
            { icon: <Twitter size={16} />, href: '#' },
            { icon: <Linkedin size={16} />, href: '#' },
            { icon: <Mail size={16} />, href: 'mailto:support@SparkTech.com' },
          ].map(({ icon, href }, i) => (
            <a key={i} href={href} style={{ color: 'var(--text-muted)', transition: 'var(--transition)', display: 'flex' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >{icon}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
