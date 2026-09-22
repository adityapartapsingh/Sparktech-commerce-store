import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const OPENINGS = [
  {
    title: 'Embedded Hardware Applications Engineer',
    department: 'Engineering & R&D',
    location: 'Pune, Maharashtra (On-site)',
    type: 'Full-time',
    desc: 'Validate new microcontroller breakouts, build open-source robotics demo projects, and author verified pinout schematics for our product catalog.',
    reqs: ['Proficiency with STM32 / ESP32 / Arduino C++', 'Experience with oscilloscope & logic analyzer test benches', 'Strong technical writing skills'],
  },
  {
    title: 'Full Stack Web Developer (MERN)',
    department: 'Software Engineering',
    location: 'Pune, Maharashtra / Hybrid',
    type: 'Full-time',
    desc: 'Scale our React e-commerce frontend, Node.js microservices, real-time inventory management, and automated GST billing engines.',
    reqs: ['React 18/19, Node.js, Express, MongoDB Atlas, Redis', 'State management (Zustand/Redux) and Tailwind/CSS optimization', 'RESTful API security & payment integrations'],
  },
  {
    title: 'Electronics Fulfillment & Quality Specialist',
    department: 'Operations & Logistics',
    location: 'Pune fulfillment hub',
    type: 'Full-time',
    desc: 'Oversee ESD-safe packaging protocols, component batch testing, inventory audits, and same-day courier dispatch management.',
    reqs: ['Understanding of electronic components and SMD packages', 'Attention to detail in ESD packaging and inventory tracking', 'Familiarity with Indian logistics systems'],
  },
];

export default function CareersPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Careers at SparkTech — Build the Hardware Future</title>
        <meta
          name="description"
          content="Explore open roles in embedded engineering, full stack development, and hardware logistics at SparkTech Technologies in Pune."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '4rem 3rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="badge badge-purple" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            JOIN OUR TEAM
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Help Build India&apos;s Premier{' '}
            <span style={{ color: 'var(--accent-blue)' }}>Robotics Platform</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.65 }}>
            We are passionate engineers, tinkerers, and builders democratizing access to genuine hardware silicon and rapid prototyping.
          </p>
        </div>
      </section>

      {/* Open Roles */}
      <section className="section" style={{ paddingBlock: '4rem 5rem' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Open Positions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join our hardware laboratory in Hinjawadi, Pune</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {OPENINGS.map((job, idx) => (
              <div key={idx} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{job.type}</span>
                    </div>
                  </div>

                  <a
                    href={`mailto:careers@sparktech.in?subject=Application: ${encodeURIComponent(job.title)}`}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    Apply Now <ArrowRight size={14} />
                  </a>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {job.desc}
                </p>

                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Key Requirements:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {job.reqs.map((req, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={15} color="var(--accent-green)" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>Don&apos;t see your exact role?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              We are always excited to meet hardware tinkerers, CAD designers, and embedded developers. Send your portfolio or resume to <strong>careers@sparktech.in</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
