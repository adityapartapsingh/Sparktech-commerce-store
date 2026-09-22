import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Zap, ShieldCheck, Truck, Award,
  CheckCircle2, ArrowRight, Microchip
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const STATS = [
  { number: '50,000+', label: 'Engineers & Makers Supported' },
  { number: '500+',    label: 'Atal Tinkering & College Labs' },
  { number: '100%',    label: 'Genuine Verified Silicon' },
  { number: '24h',     label: 'Same-Day Dispatch Window' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Zero Counterfeit Guarantee',
    desc: 'Every IC, development board, and sensor is sourced directly from authorized semiconductor distributors or our audited manufacturing partners.',
    color: '#3B82F6',
  },
  {
    icon: Microchip,
    title: 'Verified Technical Documentation',
    desc: 'We verify every pinout diagram and provide direct downloadable datasheets so you never burn a chip with inverted polarities.',
    color: '#10B981',
  },
  {
    icon: Truck,
    title: 'Express ESD-Safe Shipping',
    desc: 'Every sensitive MOSFET, MCU, and display is packed in certified anti-static shielding with same-day dispatch for orders before 2 PM IST.',
    color: '#F59E0B',
  },
  {
    icon: Award,
    title: 'STEM & Atal Tinkering Partner',
    desc: 'Specialized modular robotics and IoT kits designed specifically for students, school innovation labs, and academic hackathons across India.',
    color: '#8B5CF6',
  },
];

const TIMELINE = [
  {
    year: '2022',
    title: 'The Dorm Room Lab',
    desc: 'Started as a hardware tinkering initiative in Pune, supplying fellow robotics enthusiasts with hard-to-find motor drivers and microcontrollers.',
  },
  {
    year: '2023',
    title: 'Direct Semiconductor Sourcing',
    desc: 'Established formal partnerships with component fabricators, expanding into RTK GNSS breakouts, industrial sensors, and precision electronics.',
  },
  {
    year: '2024',
    title: 'Atal Lab & STEM Kit Deployment',
    desc: 'Launched turnkey educational hardware kits tailored for Atal Tinkering Labs (ATL) and university engineering faculties.',
  },
  {
    year: '2025 - Present',
    title: 'Rapid Prototyping & B2B Ecosystem',
    desc: 'Expanded into on-demand PCB fabrication, custom laser prototyping, automated GST invoicing, and country-wide express logistics.',
  },
];

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>About Us — SparkTech Robotics & Electronics</title>
        <meta
          name="description"
          content="Learn about SparkTech's mission to power India's hardware and robotics renaissance with 100% genuine components, verified datasheets, and express dispatch."
        />
      </Helmet>

      {/* Hero Section */}
      <section style={{ paddingBlock: '4.5rem 3.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 840 }}>
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="badge badge-blue" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
              OUR MISSION &amp; STORY
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Empowering India&apos;s Next Generation of{' '}
              <span style={{ color: 'var(--accent-blue)' }}>Robotics Innovators</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.12rem', lineHeight: 1.75, margin: '0 auto 2rem' }}>
              SparkTech was built by hardware engineers who experienced the frustration of fake silicon, missing datasheets, and delayed shipping. Today, we supply genuine microcontrollers, precision sensors, and custom fabrication to over 50,000 makers, colleges, and hardware startups across India.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn btn-outline btn-lg">
                Our Engineering Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section style={{ paddingBlock: '2.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {STATS.map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)', lineHeight: 1.1 }}>
                  {stat.number}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose & Philosophy */}
      <section className="section" style={{ paddingBlock: '4.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Why We Exist
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.5rem 0 1.25rem' }}>
                Hardware is Hard. We Make Sourcing the Easy Part.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                In an ecosystem flooded with counterfeit microchips, mislabeled pinouts, and non-existent customer support, hardware builders spend more time debugging broken components than developing firmware.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                At SparkTech, every component in our catalog undergoes bench testing with oscilloscopes and logic analyzers before listing. When you download a schematic from our store, it is the exact pinout that will arrive on your workbench.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  '100% Bench-Tested Breakouts & Module Verification',
                  'Instant Downloadable PDF Datasheets & Eagle/KiCAD Footprints',
                  'Same-Day Dispatch with Anti-Static ESD Packaging',
                  'Automated GST Input Tax Credit (ITC) Invoicing for Institutions & Startups',
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="var(--accent-green)" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>The SparkTech Standard</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Quality Protocol for Every Order</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h5 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--accent-blue)' }}>1. Pre-Listing Validation</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Samples from every production batch are connected to microcontrollers and tested across operational voltage limits.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h5 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--accent-green)' }}>2. Electrostatic Protection</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Moisture-barrier and static shielding bags ensure your sensitive chips arrive in pristine silicon state.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h5 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--accent-amber)' }}>3. Dedicated Support</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Direct access to hardware engineers ready to help with component selection and wiring diagrams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ background: 'var(--bg-secondary)', paddingBlock: '4.5rem' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Built On Integrity
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: '0.35rem' }}>
              Our Core Principles
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              How we operate our hardware catalog and engineering services
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.75rem' }}>
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.08 }}>
                  <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12,
                      background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: val.color, marginBottom: '1.25rem'
                    }}>
                      <Icon size={26} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                      {val.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                      {val.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ paddingBlock: '4.5rem' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Evolution
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, marginTop: '0.35rem' }}>
              The SparkTech Journey
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {TIMELINE.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 70, flexShrink: 0, padding: '0.5rem 0.75rem', borderRadius: 8,
                    background: 'var(--accent-blue)', color: '#fff', textAlign: 'center',
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem'
                  }}>
                    {item.year}
                  </div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ paddingBlock: '4.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>
            Ready to Build Your Next Invention?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Browse over 50 real hardware breakouts, sensors, and development boards, or consult our engineering team for custom institutional lab requirements.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop Components Now <ArrowRight size={18} />
            </Link>
            <Link to="/support" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
              Contact Our Lab
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
