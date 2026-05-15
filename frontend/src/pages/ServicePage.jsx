import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Cpu, Wrench, Package, Shield, Users, Headphones,
  ArrowRight, CheckCircle2, Zap, Building2, GraduationCap, Rocket
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const SERVICES = [
  {
    icon: Cpu,
    title: 'Custom PCB Assembly',
    desc: 'From prototype to production — we design, fabricate, and assemble custom PCBs tailored to your project specifications.',
    features: ['Schematic review & DFM checks', 'SMD & through-hole assembly', 'Quick-turn prototypes (5–7 days)', 'Volume production pricing'],
    color: 'var(--accent-blue)',
  },
  {
    icon: Wrench,
    title: 'Project Consultation',
    desc: 'Our team of experienced engineers will help you select the right components and architecture for your embedded systems project.',
    features: ['Component selection guidance', 'Architecture & design review', 'BOM optimization', 'Video consultations available'],
    color: 'var(--accent-purple)',
  },
  {
    icon: Package,
    title: 'Bulk Orders & Institutional Supply',
    desc: 'Special pricing for universities, R&D labs, startups, and businesses ordering components in bulk.',
    features: ['Volume discounts up to 30%', 'Dedicated account manager', 'Custom kits & bundles', 'Priority stock reservation'],
    color: 'var(--accent-green)',
  },
  {
    icon: Shield,
    title: 'Warranty & Repair Services',
    desc: 'All products come with a manufacturer warranty. We also offer component-level repair and replacement for defective parts.',
    features: ['Hassle-free replacement policy', 'DOA (Dead on Arrival) instant swap', 'Component-level diagnostics', 'Extended warranty options'],
    color: 'var(--accent-amber)',
  },
];

const STATS = [
  { value: '50,000+', label: 'Engineers served', icon: Users },
  { value: '10,000+', label: 'Products shipped', icon: Package },
  { value: '500+', label: 'Institutions supplied', icon: GraduationCap },
  { value: '99.2%', label: 'Satisfaction rate', icon: Rocket },
];

const ServicePage = () => (
  <div className="page-wrapper">
    <Helmet>
      <title>Our Services | SparkTech</title>
      <meta name="description" content="SparkTech offers Custom PCB Assembly, Project Consultation, Bulk Orders, and Warranty Services for engineers, makers, and institutions across India." />
    </Helmet>

    {/* ═══ HERO ═══ */}
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '7rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.span variants={fadeUp} className="badge badge-purple" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            Engineering-Grade Services
          </motion.span>
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Beyond Just Components —{' '}
            <span style={{ color: 'var(--accent-blue)' }}>We Build With You</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '2rem' }}>
            SparkTech isn't just a store. We provide end-to-end engineering services — from PCB assembly to bulk supply — so you can focus on innovation.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/support" className="btn btn-primary btn-lg">
              <Headphones size={18} /> Get in Touch
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              Browse Components <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* ═══ STATS BAR ═══ */}
    <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        {STATS.map((s, i) => (
          <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <s.icon size={18} color="var(--accent-blue)" />
              <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* ═══ SERVICES ═══ */}
    <section className="section">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h2>What We Offer</h2>
          <p>Comprehensive engineering services for every stage of your project</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {SERVICES.map((service, i) => (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}>
              <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', borderTop: `3px solid ${service.color}` }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem', color: service.color,
                }}>
                  <service.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem' }}>{service.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{service.desc}</p>
                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {service.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={15} color={service.color} style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/support" className="btn btn-outline" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                  Inquire <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ WHO WE SERVE ═══ */}
    <section className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h2>Who We Serve</h2>
          <p>From individual hobbyists to large-scale institutions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: Zap, title: 'Hobbyists & Makers', desc: 'DIY projects, home automation, robotics kits' },
            { icon: Rocket, title: 'Startups', desc: 'MVP prototyping, pilot production runs' },
            { icon: GraduationCap, title: 'Universities & Labs', desc: 'Curriculum kits, research supplies, bulk orders' },
            { icon: Building2, title: 'Enterprises', desc: 'Custom sourcing, dedicated pricing, SLA support' },
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }}>
              <div className="card-flat" style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', color: 'var(--accent-blue)',
                }}>
                  <item.icon size={24} />
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ CTA ═══ */}
    <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
        <Headphones size={40} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to start your project?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7 }}>
          Reach out through our Support Portal and our engineering team will get back to you within 24 hours.
        </p>
        <Link to="/support" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
          Contact Our Team <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  </div>
);

export default ServicePage;
