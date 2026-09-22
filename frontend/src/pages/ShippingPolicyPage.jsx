import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Clock, RefreshCw, PackageCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Shipping &amp; Replacement Policy — SparkTech</title>
        <meta
          name="description"
          content="Read SparkTech's shipping timelines, express air couriers, same-day dispatch cutoff, ESD anti-static packaging, and 7-day replacement guarantee."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            LOGISTICS &amp; GUARANTEE
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            Shipping &amp; Replacement Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Reliable hardware logistics, certified anti-static ESD packaging, and instant 7-day DOA component swap.
          </p>
        </div>
      </section>

      {/* Body Content */}
      <section className="section" style={{ paddingBlock: '3.5rem 4.5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* 1. Dispatch Timelines */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Clock size={22} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Same-Day Express Dispatch</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                All orders confirmed before <strong>2:00 PM IST</strong> from Monday through Saturday are packed in ESD-safe shielding and dispatched from our Pune fulfillment hub on the exact same business day. Orders confirmed after 2:00 PM or on Sundays/National Holidays dispatch on the immediate next operating business day.
              </p>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                ⚡ <strong>Real-Time Tracking:</strong> As soon as your shipment is scanned by the courier, an SMS and email notification with direct live tracking link from BlueDart, Delhivery, or DTDC is dispatched.
              </div>
            </div>

            {/* 2. Transit Timelines */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Truck size={22} color="var(--accent-green)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Estimated Delivery Timelines Across India</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-blue)', marginBottom: '0.35rem' }}>Tier 1 Metro Hubs</h4>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>24 – 48 Hours</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad, Chennai, Kolkata</p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-green)', marginBottom: '0.35rem' }}>Tier 2 &amp; Tier 3 Cities</h4>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>2 – 4 Days</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>State capitals, industrial zones, and prominent educational districts</p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>Remote &amp; North East</h4>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>4 – 6 Days</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Assam, Meghalaya, J&amp;K, Andaman &amp; Nicobar, and hill regions</p>
                </div>
              </div>
            </div>

            {/* 3. Anti-Static Packaging Standard */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <PackageCheck size={22} color="var(--accent-purple)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Certified ESD Packaging Protocols</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                Electronic semiconductors and sensitive development modules (ESP32, STM32, CMOS sensors) are susceptible to static charges. Every IC in our facility is handled on grounded dissipative mats and sealed in certified metallized static-shielding bags with moisture-absorbent silica before shipping in corrugated multi-wall outer boxes.
              </p>
            </div>

            {/* 4. Replacement Policy */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <RefreshCw size={22} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>7-Day Dead on Arrival (DOA) Replacement</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                We understand that troubleshooting hardware issues can be time-sensitive. If an item arrives non-functional, damaged, or defective:
              </p>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1.25rem' }}>
                <li>Notify our team within <strong>7 days</strong> of delivery via the Support Portal or email at support@sparktech.in.</li>
                <li>Share a clear photo or short video showing your wiring/test bench setup.</li>
                <li>Once validated by our hardware support engineer, an express replacement is dispatched at zero additional cost to you, with reverse pickup arranged for the defective part.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
