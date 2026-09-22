import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, Star, FileText } from 'lucide-react';

export default function HeroProductShowcase() {
  return (
    <div style={{ width: '100%', maxWidth: 540, position: 'relative' }}>
      {/* Main Showcase Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
        transition: 'all 0.3s ease',
      }}>
        {/* Top Card Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.8rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent-green)', display: 'inline-block',
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              In Stock & Ready to Ship
            </span>
          </div>
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <Star size={13} fill="#F59E0B" color="#F59E0B" /> 4.9 (140+ reviews)
          </span>
        </div>

        {/* Product Image Viewport */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
          <img
            src="/images/robotics-hero.jpg"
            alt="Robotics and microcontrollers hardware showcase"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="eager"
          />

          {/* Floating Tag */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '0.35rem 0.75rem',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            Robotics Prototyping Rig
          </div>
        </div>

        {/* Card Footer Detail */}
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                Advanced Robotics & IoT Developer Kit
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Dual-core ESP32-S3, 12 sensor modules, servo actuators, and power breakout.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹2,499</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹3,299</span>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>24% OFF</span>
            </div>

            <Link
              to="/shop"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              Shop Kits <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges under Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '1rem',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}>
          <ShieldCheck size={16} color="var(--accent-blue)" />
          <span style={{ fontWeight: 500 }}>100% Genuine</span>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}>
          <FileText size={16} color="var(--accent-green)" />
          <span style={{ fontWeight: 500 }}>GST Invoices</span>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}>
          <Truck size={16} color="#F59E0B" />
          <span style={{ fontWeight: 500 }}>Fast Courier</span>
        </div>
      </div>
    </div>
  );
}
