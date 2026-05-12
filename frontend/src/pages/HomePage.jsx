import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Zap, Shield, Truck, Headphones, ChevronRight, Wifi, Gauge, Monitor, BatteryCharging, Cog, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import ProductCard from '../features/products/components/ProductCard';
import FallbackState from '../components/ui/FallbackState';

const CATEGORIES = [
  { label: 'Microcontrollers', slug: 'microcontrollers', icon: Cpu,              desc: 'Arduino, ESP32, Raspberry Pi' },
  { label: 'Sensors',          slug: 'sensors',          icon: Gauge,            desc: 'Temperature, Ultrasonic, IR' },
  { label: 'Motors & Drivers', slug: 'motors',           icon: Cog,              desc: 'Servo, Stepper, DC Motors' },
  { label: 'Power Modules',    slug: 'power',            icon: BatteryCharging,  desc: 'Regulators, Battery Packs' },
  { label: 'Displays',         slug: 'displays',         icon: Monitor,          desc: 'OLED, LCD, TFT Panels' },
  { label: 'Connectivity',     slug: 'connectivity',     icon: Wifi,             desc: 'WiFi, Bluetooth, LoRa' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const HomePage = () => {
  const { data: featuredData, isError, isLoading, refetch } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data.data),
    retry: 2,
  });

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>SparkTech — India's Trusted Electronics & Robotics Store</title>
        <meta name="description" content="Shop microcontrollers, sensors, motors, and electronic components. Same-day dispatch, datasheets included. Trusted by 50,000+ makers and engineers across India." />
        <meta property="og:title" content="SparkTech — Electronics & Robotics Store" />
        <meta property="og:description" content="Premium robotic and electronic components for engineers, makers, and innovators." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ═══ HERO ═══ */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '6rem',
        paddingBottom: '4rem',
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          {/* Left — Copy */}
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.span variants={fadeUp} className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              Trusted by 50,000+ Engineers
            </motion.span>
            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.12, marginBottom: '1.25rem' }}>
              India's Go-To Store for
              <br />
              <span style={{ color: 'var(--accent-blue)' }}>Electronics & Robotics</span>
            </motion.h1>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 460 }}>
              Premium components for your next project. From Arduino to industrial sensors — we ship same-day with datasheets included.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse Products <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="btn btn-outline btn-lg">
                Featured Picks
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              width: '100%',
              maxWidth: 520,
              aspectRatio: '4/3',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              <img
                src="/images/hero-banner.png"
                alt="Electronic components workspace"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="trust-bar">
        {[
          { icon: <Truck size={18} />,       text: 'Same-Day Dispatch' },
          { icon: <Shield size={18} />,      text: 'Genuine Components' },
          { icon: <Zap size={18} />,         text: 'Datasheets Included' },
          { icon: <Headphones size={18} />,  text: 'Engineer Support' },
        ].map(({ icon, text }) => (
          <div className="trust-item" key={text}>
            <div className="trust-icon">{icon}</div>
            <span style={{ fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2>Shop by Category</h2>
            <p>Find exactly what your project needs</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                <Link to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem', color: 'var(--accent-blue)',
                    }}>
                      <cat.icon size={24} />
                    </div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.92rem' }}>{cat.label}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <h2>Featured Products</h2>
              <p>Hand-picked by our engineering team</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
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
              {featuredData.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <FallbackState
              type="search"
              title="No featured products yet"
              message="Check back soon — we're always adding new picks."
              action={{ label: 'Browse All Products', to: '/products' }}
            />
          )}
        </div>
      </section>

      {/* ═══ WHY SparkTech ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2>Why engineers choose SparkTech</h2>
            <p>Trusted by hobbyists, startups, and universities across India</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: <Truck size={22} />,       title: 'Same-Day Dispatch',   desc: 'Orders placed before 4 PM ship the same business day.' },
              { icon: <Shield size={22} />,      title: '100% Genuine Parts',   desc: 'Every component is sourced from authorized distributors.' },
              { icon: <Zap size={22} />,         title: 'Datasheets Included',  desc: 'Every product page includes technical specifications and PDFs.' },
              { icon: <Headphones size={22} />,  title: 'Expert Support',       desc: 'Our engineers help you pick the right components via chat and email.' },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                <div className="card-flat" style={{ padding: '1.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem', color: 'var(--accent-blue)',
                  }}>
                    {item.icon}
                  </div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 560 }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Stay in the loop</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            Get notified about new products, restocks, and exclusive deals.
          </p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '0.5rem', maxWidth: 420, margin: '0 auto' }}>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
