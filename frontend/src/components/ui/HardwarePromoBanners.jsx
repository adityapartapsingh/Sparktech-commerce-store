import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, GraduationCap, Plane } from 'lucide-react';

export default function HardwarePromoBanners() {
  return (
    <section style={{ paddingBlock: '1.75rem 1.25rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Banner 1: School Students & Atal Tinkering Lab (ATL) Kits */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            color: '#fff',
            overflow: 'hidden',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px',
          }}
        >
          {/* Subtle blue accent glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '45%',
              background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#93C5FD',
                  fontWeight: 700,
                  background: 'rgba(37, 99, 235, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(147, 197, 253, 0.3)',
                }}
              >
                <GraduationCap size={13} /> ATL APPROVED • STEM LABS
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '0.4rem' }}>
              School Students &amp; Atal Lab Kits
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '1rem' }}>
              Complete hands-on STEM robotics kits designed for schools, engineering colleges &amp; Atal Tinkering Labs across India.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                '30+ Hands-on DIY Science & Robotics Projects',
                'Pre-configured Arduino Uno & Sensor Bundles',
                'Comprehensive Project Manuals & Video Guides',
                'Bulk Institutional Supply with GST Billing',
              ].map((bullet, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#E2E8F0' }}>
                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={11} color="#60A5FA" strokeWidth={3} />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              to="/shop?category=microcontrollers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              EXPLORE STUDENT KITS <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Banner 2: Drone Parts & Rapid PCB Prototyping */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #061A1D 0%, #0D2D33 100%)',
            border: '1px solid rgba(20, 184, 166, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            color: '#fff',
            overflow: 'hidden',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px',
          }}
        >
          {/* Teal ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '45%',
              background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#5EEAD4',
                  fontWeight: 700,
                  background: 'rgba(20, 184, 166, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                }}
              >
                <Plane size={13} /> UAV &amp; RAPID FABRICATION
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Drone Kits &amp; Custom PCB Printing
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#CCFBF1', lineHeight: 1.5, marginBottom: '1rem' }}>
              High-thrust BLDC motors, ESC speed controllers, flight boards &amp; quick-turn custom prototype PCB printing services.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                '1000KV–2300KV Brushless Motors & SimonK ESCs',
                'F4 / F7 Flight Controllers with Betaflight Support',
                '2-Layer & 4-Layer Quick-Turn PCB Fabrication',
                'Fast Courier Dispatch Across All Indian States',
              ].map((bullet, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#E6FFFA' }}>
                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={11} color="#2DD4BF" strokeWidth={3} />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              to="/shop?category=motors"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              ORDER DRONE &amp; PCB PARTS <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
