import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: 'Innovation & Prototyping',
    title: 'Research & Development',
    subtitle: 'Driving innovation through cutting-edge research, custom PCB prototyping, and advanced robotics engineering.',
    ctaText: 'Explore R&D Services',
    ctaLink: '/services',
    bgGradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
    badgeColor: 'var(--accent-blue)',
    visualType: 'illustration',
  },
  {
    id: 2,
    badge: 'Developer Edition',
    title: 'Robotics & IoT Dev Kits',
    subtitle: 'High-performance microcontrollers, motor drivers, and modular sensor expansion boards ready for immediate dispatch.',
    ctaText: 'Shop Kits Now',
    ctaLink: '/shop?category=microcontrollers',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
    badgeColor: '#10B981',
    visualType: 'hardware',
  },
  {
    id: 3,
    badge: 'Precision Telemetry',
    title: 'Sensors & GNSS Modules',
    subtitle: 'Centimeter-grade RTK positioning, mmWave radar, and industrial IMUs backed with verified pinouts and datasheets.',
    ctaText: 'Browse Sensors',
    ctaLink: '/shop?category=sensors',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
    badgeColor: '#F59E0B',
    visualType: 'sensors',
  },
];

export default function HeroBannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = SLIDES[current];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: slide.bgGradient,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        transition: 'background 0.5s ease',
        minHeight: '380px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'center',
            gap: '2.5rem',
            minHeight: '380px',
          }}
        >
          {/* Left Text Column */}
          <div style={{ maxWidth: 520 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: slide.badgeColor,
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} />
              {slide.badge}
            </span>

            <h1
              style={{
                fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              {slide.title}
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}
            >
              {slide.subtitle}
            </p>

            <Link
              to={slide.ctaLink}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              {slide.ctaText}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right Visual Column */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {slide.visualType === 'illustration' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 380,
                  height: 260,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Clean Flat R&D Graphic */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-blue)',
                    marginBottom: '1rem',
                  }}
                >
                  <Cpu size={46} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Rapid Embedded Lab
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  CAD • Firmware • 4-Layer PCB Stacking • Automated Testing
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '1rem',
                  }}
                >
                  <span className="badge badge-blue">ISO 9001 Process</span>
                  <span className="badge badge-green">48hr Prototyping</span>
                </div>
              </div>
            )}

            {slide.visualType === 'hardware' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 380,
                  height: 260,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.12)',
                }}
              >
                <img
                  src="/images/robotics-hero.jpg"
                  alt="Robotics Dev Kit"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    right: 12,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>ARM Cortex-M7 + Dual CAN-FD</span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>In Stock</span>
                </div>
              </div>
            )}

            {slide.visualType === 'sensors' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 380,
                  height: 260,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                    marginBottom: '1rem',
                  }}
                >
                  <Layers size={46} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  GNSS RTK &amp; Radar Breakouts
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Sub-Centimeter Accuracy • Multi-Band Tracking • Plug &amp; Play I2C/SPI
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '1rem' }}>
                  <span className="badge badge-amber">u-blox ZED-X20P</span>
                  <span className="badge badge-blue">Ready to Ship</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous Slide"
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 5,
          opacity: 0.85,
          transition: 'all 0.2s',
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        aria-label="Next Slide"
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 5,
          opacity: 0.85,
          transition: 'all 0.2s',
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Navigation Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 5,
        }}
      >
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: current === idx ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: current === idx ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
