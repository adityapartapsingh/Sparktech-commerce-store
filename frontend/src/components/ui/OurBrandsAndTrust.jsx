import React from 'react';
import { Hexagon, Zap, Settings } from 'lucide-react';

export default function OurBrandsAndTrust() {
  return (
    <div>
      {/* 1. Our Own Brands - Make In India */}
      <section className="section" style={{ paddingBottom: '3.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              OUR OWN <span style={{ color: 'var(--accent-blue)' }}>BRANDS</span>
            </h2>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              MAKE IN INDIA
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Brand 1 */}
            <div
              className="card"
              style={{
                padding: '2.25rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                }}
              >
                <Hexagon size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                SPARK-MECH
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Mechanical Components &amp; Aluminum Chassis
              </p>
            </div>

            {/* Brand 2 */}
            <div
              className="card"
              style={{
                padding: '2.25rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10B981')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#10B981',
                }}
              >
                <Zap size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                ELECTRO-SPARK
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Electronics Components &amp; Sensor Breakouts
              </p>
            </div>

            {/* Brand 3 */}
            <div
              className="card"
              style={{
                padding: '2.25rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#F59E0B',
                }}
              >
                <Settings size={36} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                DRIVE-TECH
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                UGV, AGV &amp; STEM Educational Robotics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Trust We Gained Banner */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #0B1120 0%, #060B14 100%)',
          color: '#FFFFFF',
          paddingBlock: '4rem 4.5rem',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle radial backdrop accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Story text */}
            <div style={{ maxWidth: 540 }}>
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem',
                  lineHeight: 1.2,
                }}
              >
                THE <span style={{ color: '#60A5FA' }}>TRUST</span> WE GAINED
              </h2>
              <p style={{ fontSize: '0.94rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '1rem' }}>
                Since 2020, SparkTech has been committed to delivering exceptional products and services, earning the trust of countless engineering students, tech colleges, and industrial robotics laboratories across India.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                Our dedication to quality, verified technical datasheets, and responsive after-sales engineer support has set us apart in the robotics industry.
              </p>
            </div>

            {/* 4 Counter Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem 1.5rem' }}>
              <div>
                <div style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                  5000+
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.08em', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                  CUSTOMERS
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                  500+
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.08em', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                  SKU'S IN STOCK
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                  150+
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.08em', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                  COLLEGE &amp; LAB PROJECTS
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                  50+
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.08em', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                  B2B INDUSTRY PARTNERS
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
