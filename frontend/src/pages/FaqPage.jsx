import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronDown, ChevronUp, Package, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    title: 'Ordering, Payments & Invoicing',
    icon: FileText,
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major Indian payment methods through our secure Razorpay gateway: UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards (Visa, MasterCard, RuPay), Netbanking across 50+ banks, and Corporate Credit Cards.',
      },
      {
        q: 'Can I get a formal GST invoice for my business or college?',
        a: 'Yes. At checkout, provide your 15-digit GSTIN and registered legal entity name. Your invoice with HSN codes and breakdown of CGST, SGST, or IGST will be automatically generated upon order completion and available as a downloadable PDF in your account.',
      },
      {
        q: 'Can institutions place orders via Purchase Orders (PO)?',
        a: 'Yes, recognized universities, government research laboratories (DRDO, ISRO, CSIR), and Atal Tinkering Labs can place orders against verified institutional POs. Please contact sales@sparktech.in for formal quotation creation.',
      },
    ],
  },
  {
    title: 'Shipping, Delivery & Tracking',
    icon: Package,
    items: [
      {
        q: 'When will my order ship?',
        a: 'Orders placed and confirmed before 2:00 PM IST Monday through Saturday are dispatched the same day from our Pune fulfillment hub. Orders placed after 2:00 PM or on Sundays dispatch on the next business day.',
      },
      {
        q: 'How long does delivery take across India?',
        a: 'Metro cities (Mumbai, Bengaluru, Delhi NCR, Pune, Chennai, Hyderabad, Kolkata) generally receive deliveries within 24 to 48 hours. Tier-2 and Tier-3 cities take 2 to 4 business days. Remote locations, J&K, and North-Eastern states typically take 4 to 6 business days.',
      },
      {
        q: 'Which courier services do you use?',
        a: 'We partner with premium express air couriers including BlueDart Express, Delhivery Air, DTDC, and India Post Speed Post for defense or remote pincodes.',
      },
    ],
  },
  {
    title: 'Component Quality & Warranty',
    icon: ShieldCheck,
    items: [
      {
        q: 'Are your silicon chips and microcontrollers 100% genuine?',
        a: 'Yes. We strictly source from authorized semiconductor manufacturers and franchised distributors. We do not deal in refurbished or counterfeit pulled chips. Every batch is random-sampled and tested on our lab oscilloscopes before catalog stocking.',
      },
      {
        q: 'What if a component arrives Dead on Arrival (DOA)?',
        a: 'We provide an unconditional 7-day replacement guarantee for any component that is defective on arrival. Simply send us a photograph or brief description via our Support Portal, and our team will dispatch a replacement immediately.',
      },
      {
        q: 'Where do I find datasheets and pinout diagrams?',
        a: 'Every single product page on SparkTech includes a dedicated "Technical Specifications" tab and direct verified datasheet links with pinouts and recommended operating voltage limits.',
      },
    ],
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (secIdx, itemIdx) => {
    const key = `${secIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Frequently Asked Questions (FAQ) — SparkTech</title>
        <meta
          name="description"
          content="Find answers to common questions about ordering microcontrollers, robotics sensors, GST invoicing, shipping timelines, and returns at SparkTech."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            HELP CENTER
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Everything you need to know about component sourcing, technical datasheets, delivery speed, and GST billing.
          </p>

          {/* Search Box */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search answers (e.g. GST, DOA, BlueDart, Arduino)..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ paddingBlock: '3.5rem 4.5rem' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {FAQ_SECTIONS.map((section, secIdx) => {
              const Icon = section.icon;
              const filteredItems = section.items.filter(
                (item) =>
                  !search ||
                  item.q.toLowerCase().includes(search.toLowerCase()) ||
                  item.a.toLowerCase().includes(search.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={secIdx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {section.title}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredItems.map((item, itemIdx) => {
                      const isOpen = !!openItems[`${secIdx}-${itemIdx}`] || !!search;
                      return (
                        <div
                          key={itemIdx}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(secIdx, itemIdx)}
                            style={{
                              width: '100%',
                              padding: '1rem 1.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              fontSize: '0.94rem',
                            }}
                          >
                            <span>{item.q}</span>
                            {isOpen ? <ChevronUp size={18} color="var(--accent-blue)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                          </button>

                          {isOpen && (
                            <div style={{ padding: '0 1.25rem 1.15rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, borderTop: '1px solid var(--border)' }}>
                              <p style={{ margin: '0.75rem 0 0' }}>{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need more help */}
          <div style={{ marginTop: '3.5rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Still have questions?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Our hardware engineers are available Mon–Sat from 9:30 AM to 7:00 PM IST to assist you.
            </p>
            <Link to="/support" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              Contact Support Desk <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
