import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Zap, Package, Crown, ArrowRight, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import ProductCard from '../features/products/components/ProductCard';

const CATEGORIES = [
  { label: 'Microcontrollers', slug: 'microcontrollers', icon: '🎮', description: 'Arduino, ESP32, Raspberry Pi' },
  { label: 'Sensors',          slug: 'sensors',          icon: '📡', description: 'Temperature, Ultrasonic, IR' },
  { label: 'Motors & Actuators',slug:'motors',           icon: '⚙️', description: 'Servo, Stepper, DC Motors' },
  { label: 'Power Modules',    slug: 'power',            icon: '⚡', description: 'Regulators, Battery Modules' },
  { label: 'Displays',         slug: 'displays',         icon: '🖥️', description: 'OLED, LCD, TFT Panels' },
  { label: 'Connectivity',     slug: 'connectivity',     icon: '📶', description: 'WiFi, Bluetooth, LoRa' },
];

const statVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const HomePage = () => {
  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data.data),
  });

  const [countdown, setCountdown] = useState({ h: 4, m: 59, s: 59 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>RoboMart | Professional Robotics & Electronics Store</title>
        <meta name="description" content="Shop industrial-grade microcontrollers, sensors, motors, and electronic components for your next tech project. Premium parts, fast shipping." />
        <meta property="og:title" content="RoboMart | Professional Robotics & Electronics Store" />
        <meta property="og:description" content="Shop industrial-grade microcontrollers, sensors, motors, and electronic components. Premium parts, fast shipping." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* === HERO === */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '5rem',
      }}>
        {/* Background glow orbs */}
        <div style={{ position:'absolute', top:'20%', left:'10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="container" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', padding:'4rem 1.5rem' }}>
          {/* Left */}
          <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
            <span className="badge badge-blue" style={{ marginBottom:'1rem', display:'inline-flex' }}>
              ⚡ 10,000+ Components In Stock
            </span>
            <h1 style={{ fontSize:'clamp(2.5rem, 6vw, 4.5rem)', fontFamily:'Outfit,sans-serif', fontWeight:900, lineHeight:1.05, marginBottom:'1.5rem' }}>
              Build the
              <br />
              <span className="gradient-text">Future</span> with
              <br />
              Precision Parts
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'1.15rem', lineHeight:1.8, marginBottom:'2.5rem', maxWidth:480 }}>
              Premium robotic and electronic components for engineers, makers, and innovators. 
              Same-day dispatch. Datasheet guaranteed.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <Link to="/products" className="btn btn-primary" style={{ padding:'0.875rem 2rem', fontSize:'1rem' }}>
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="btn btn-outline" style={{ padding:'0.875rem 2rem', fontSize:'1rem' }}>
                View Featured
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1.5rem', marginTop:'3rem' }}>
              {[
                { value:'10K+', label:'Products' },
                { value:'50K+', label:'Happy Makers' },
                { value:'4.9★', label:'Avg Rating' },
              ].map((stat, i) => (
                <motion.div key={stat.label} custom={i} variants={statVariants} initial="hidden" animate="visible">
                  <p style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'var(--accent-blue)' }}>{stat.value}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — decorative */}
          <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, delay:0.2 }}
            style={{ display:'flex', justifyContent:'center', alignItems:'center' }}
          >
            <div style={{ position:'relative', width:420, height:420 }}>
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position:'absolute', inset:20,
                  borderRadius:'50%',
                  border:'1px dashed rgba(0,212,255,0.2)',
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{
                  position:'absolute', inset:60,
                  borderRadius:'50%',
                  border:'1px dashed rgba(255,184,0,0.15)',
                }}
              />
              {/* Center icon */}
              <div style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{
                  width:160, height:160, borderRadius:'50%',
                  background:'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(255,184,0,0.1))',
                  border:'1px solid rgba(0,212,255,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 60px rgba(0,212,255,0.1)',
                }}>
                  <Cpu size={72} color="var(--accent-blue)" strokeWidth={1} />
                </div>
              </div>
              {/* Orbiting dots */}
              {[0, 90, 180, 270].map((deg, i) => (
                <motion.div key={i}
                  animate={{ rotate: 360 + deg }}
                  transition={{ duration: 8, repeat: Infinity, ease:'linear', delay: i * 0.5 }}
                  style={{
                    position:'absolute', inset:0,
                    display:'flex', alignItems:'flex-start', justifyContent:'center',
                  }}
                >
                  <div style={{ width:10, height:10, borderRadius:'50%', marginTop:20, background: i % 2 === 0 ? 'var(--accent-blue)' : 'var(--accent-amber)', boxShadow: i % 2 === 0 ? '0 0 10px var(--accent-blue)' : '0 0 10px var(--accent-amber)' }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === FLASH SALE BANNER === */}
      <section style={{ background:'linear-gradient(135deg, rgba(255,184,0,0.08), rgba(0,212,255,0.08))', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'1.5rem 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <span style={{ fontSize:'1.5rem' }}>⚡</span>
            <div>
              <p style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.1rem' }}>Flash Sale — Up to 40% Off!</p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Limited stock. Ends in:</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            {[
              { val: String(countdown.h).padStart(2,'0'), label:'HRS' },
              { val: String(countdown.m).padStart(2,'0'), label:'MIN' },
              { val: String(countdown.s).padStart(2,'0'), label:'SEC' },
            ].map(({ val, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ color:'var(--accent-amber)', fontWeight:700, fontSize:'1.3rem' }}>:</span>}
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'0.4rem 0.8rem', textAlign:'center', minWidth:56 }}>
                  <motion.p key={val} initial={{ y:-10, opacity:0 }} animate={{ y:0, opacity:1 }}
                    style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:700, fontSize:'1.3rem', color:'var(--accent-amber)' }}>
                    {val}
                  </motion.p>
                  <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.08em' }}>{label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
          <Link to="/products?sale=true" className="btn btn-amber">Shop Sale</Link>
        </div>
      </section>

      {/* === CATEGORIES === */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'clamp(1.8rem, 4vw, 2.5rem)', marginBottom:'0.75rem' }}>Shop by <span className="gradient-text">Category</span></h2>
            <p style={{ color:'var(--text-secondary)' }}>Find exactly what your project needs</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem' }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.05 }}>
                <Link to={`/products?category=${cat.slug}`} style={{ textDecoration:'none', display:'block' }}>
                  <div className="card" style={{ padding:'1.5rem', textAlign:'center', cursor:'pointer' }}>
                    <span style={{ fontSize:'2.5rem', display:'block', marginBottom:'0.75rem' }}>{cat.icon}</span>
                    <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'0.25rem' }}>{cat.label}</h3>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{cat.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURED PRODUCTS === */}
      <section className="section" style={{ background:'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2.5rem' }}>
            <div>
              <h2 style={{ fontSize:'clamp(1.8rem, 4vw, 2.5rem)', marginBottom:'0.5rem' }}>
                <span className="gradient-text">Featured</span> Products
              </h2>
              <p style={{ color:'var(--text-secondary)' }}>Hand-picked by our engineers</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {featuredData ? (
            <div className="product-grid">
              {featuredData.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height:320 }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === WHY CHOOSE US === */}
      <section className="section">
        <div className="container">
          <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem, 4vw, 2.5rem)', marginBottom:'3rem' }}>
            Why <span className="gradient-text">RoboMart?</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5rem' }}>
            {[
              { icon:<Zap size={24} color="var(--accent-blue)"/>,   title:'Same-Day Dispatch',  desc:'Orders before 4PM ship the same day' },
              { icon:<Package size={24} color="var(--accent-amber)"/>, title:'10K+ Components', desc:'Largest catalog of robotic parts in India' },
              { icon:<Crown size={24} color="var(--accent-purple)"/>, title:'Datasheets Included', desc:'Every product comes with technical PDFs' },
              { icon:<Cpu size={24} color="var(--accent-green)"/>,     title:'Engineer Support', desc:'Expert help via chat and email' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.08 }}>
                <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
                  <div style={{ marginBottom:'1rem', display:'flex', justifyContent:'center' }}>
                    <div style={{ width:52, height:52, borderRadius:12, background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, marginBottom:'0.5rem' }}>{item.title}</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.6 }}>{item.desc}</p>
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
