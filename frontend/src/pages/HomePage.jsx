import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu, Zap, Shield, Truck, Headphones, ChevronRight, Wifi, Gauge,
  Monitor, BatteryCharging, Cog
} from 'lucide-react';
import api from '../lib/axios';
import ProductCard from '../features/products/components/ProductCard';
import FallbackState from '../components/ui/FallbackState';
import HeroBannerSlider from '../components/ui/HeroBannerSlider';
import HardwarePromoBanners from '../components/ui/HardwarePromoBanners';
import RoboticsServicesSection from '../components/ui/RoboticsServicesSection';

const CATEGORIES = [
  { label: 'Microcontrollers', slug: 'microcontrollers', icon: Cpu,              desc: 'Arduino, ESP32, Raspberry Pi' },
  { label: 'Sensors',          slug: 'sensors',          icon: Gauge,            desc: 'Temperature, Ultrasonic, RTK' },
  { label: 'Motors & Drivers', slug: 'motors',           icon: Cog,              desc: 'Servo, Stepper, DC Motor Drivers' },
  { label: 'Power Modules',    slug: 'power',            icon: BatteryCharging,  desc: 'Regulators, Battery Packs, LDO' },
  { label: 'Displays',         slug: 'displays',         icon: Monitor,          desc: 'OLED, LCD, TFT Panels' },
  { label: 'Connectivity',     slug: 'connectivity',     icon: Wifi,             desc: 'WiFi, Bluetooth, LoRa, CAN-BUS' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const HomePage = () => {
  const { data: featuredData, isError, isLoading, refetch } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data.data),
    retry: 2,
  });

  const { data: newArrivalsData, isLoading: isNewArrivalsLoading } = useQuery({
    queryKey: ['products', { sort: 'newest', limit: 8 }],
    queryFn: () => api.get('/products', { params: { sort: 'newest', limit: 8 } }).then((r) => r.data.data.products),
  });

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>SparkTech — India's Leading Store for Robotics & Electronics</title>
        <meta name="description" content="Shop microcontrollers, sensors, motors, and robotics components with verified datasheets. Same-day dispatch across India. Trusted by 5,000+ engineers." />
        <meta property="og:title" content="SparkTech — Robotics & Electronics Store" />
        <meta property="og:description" content="Official distributor of microcontrollers, RTK GNSS breakouts, motor drivers, and prototyping services." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* 1. Hero Banner Carousel (Matching Technobotix reference Image 4) */}
      <section style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <div className="container">
          <HeroBannerSlider />
        </div>
      </section>

      {/* 2. Dual Hardware Promo Cards (Matching Robu.in reference Image 5) */}
      <HardwarePromoBanners />

      {/* 3. Shop by Category */}
      <section className="section" style={{ paddingBlock: '3rem 3.5rem' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Shop by <span style={{ color: 'var(--accent-blue)' }}>Category</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Genuine components with verified technical datasheets for every engineering project
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                <Link to={`/shop?category=${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    className="card"
                    style={{
                      padding: '1.6rem 1.2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-blue)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.85rem', color: 'var(--accent-blue)',
                    }}>
                      <cat.icon size={26} strokeWidth={1.8} />
                    </div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{cat.label}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Start Your Robotics Journey With Us & Services (Matching Technobotix reference Image 3) */}
      <RoboticsServicesSection />

      {/* 5. Featured Picks (Products Section) */}
      <section className="section" style={{ paddingBlock: '3.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800 }}>Featured Components</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tested and recommended by our engineering lab</p>
            </div>
            <Link to="/shop?featured=true" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320 }} />
              ))}
            </div>
          ) : isError ? (
            <FallbackState
              type="server"
              title="Couldn't load products"
              message="Our server might be down or your connection is slow. Please try again."
              onRetry={refetch}
            />
          ) : featuredData && featuredData.length > 0 ? (
            <div className="product-grid">
              {featuredData.slice(0, 8).map((product, i) => (
                <ProductCard key={product._id || product.id || i} product={product} />
              ))}
            </div>
          ) : (
            <FallbackState
              type="search"
              title="No featured products yet"
              message="Check back soon — our engineering team is constantly adding new arrivals."
              action={{ label: 'Browse Shop', to: '/shop' }}
            />
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section" style={{ background: 'var(--bg-secondary)', paddingBlock: '3.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="section-header" style={{ marginBottom: 0, textAlign: 'left' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800 }}>New Arrivals</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Latest robotics breakout boards and development kits</p>
            </div>
            <Link to="/shop?sort=newest" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {isNewArrivalsLoading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320 }} />
              ))}
            </div>
          ) : newArrivalsData && newArrivalsData.length > 0 ? (
            <div className="product-grid">
              {newArrivalsData.slice(0, 8).map((product, i) => (
                <ProductCard key={product._id || product.id || i} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 9. Trust Pillars & Engineering Support */}
      <section className="section" style={{ borderTop: '1px solid var(--border)', paddingBlock: '3.5rem 4rem' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 800 }}>Why Engineers Choose SparkTech</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Trusted by 5,000+ makers, engineering colleges, and startups across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Truck size={22} />,       title: 'Same-Day Express Dispatch', desc: 'Orders placed before 2 PM IST dispatch on the same business day.' },
              { icon: <Shield size={22} />,      title: '100% Genuine Silicon',       desc: 'Authorized direct sourcing with verified anti-counterfeit checks.' },
              { icon: <Zap size={22} />,         title: 'Verified Datasheets & Pinouts', desc: 'Every product page contains direct pinout diagrams and PDF schematics.' },
              { icon: <Headphones size={22} />,  title: 'Dedicated Engineering Support', desc: 'Hardware troubleshooting and component selection assistance via chat.' },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                <div className="card-flat" style={{ padding: '1.75rem', height: '100%' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem', color: 'var(--accent-blue)',
                  }}>
                    {item.icon}
                  </div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
