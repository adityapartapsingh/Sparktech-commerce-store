import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Truck, Wrench, Printer, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    title: 'ROBOTICS PARTS',
    desc: 'Actuators, motor drivers, sensor arrays, and microcontroller modules.',
    icon: Bot,
    link: '/shop',
  },
  {
    title: 'SUPPLY CHAIN MANAGEMENT',
    desc: 'B2B institutional sourcing, BOM procurement, and scheduled batch supply.',
    icon: Truck,
    link: '/services',
  },
  {
    title: 'MACHINING SERVICES',
    desc: 'Custom CNC aluminum brackets, laser acrylic cutting, and lathe finishing.',
    icon: Wrench,
    link: '/services',
  },
  {
    title: '3D PRINTING SERVICES',
    desc: 'Industrial SLA resin & FDM rapid prototyping for robotics chassis.',
    icon: Printer,
    link: '/services',
  },
];

export default function RoboticsServicesSection() {
  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        
        {/* Left Column: 2x2 Service Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Link
                key={idx}
                to={srv.link}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--accent-blue)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h4
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    color: 'var(--text-primary)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {srv.title}
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {srv.desc}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Right Column: Narrative Copy */}
        <div style={{ maxWidth: 480 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent-blue)',
              marginBottom: '0.75rem',
            }}
          >
            Engineering &amp; Prototyping
          </span>

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            START YOUR ROBOTICS JOURNEY <span style={{ color: 'var(--accent-blue)' }}>WITH US</span>
          </h2>

          <p
            style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '1.75rem',
            }}
          >
            We specialize in providing high-quality robotics parts and equipment, offering a wide range of services including supply chain management, precision machining services, and cutting-edge R&amp;D projects. With years of expertise in the industry.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/services"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.7rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Consult Our Lab <ArrowRight size={16} />
            </Link>
            <Link
              to="/support"
              className="btn btn-outline"
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Request Custom Quote
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
