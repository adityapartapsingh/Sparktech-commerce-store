import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Terms &amp; Conditions — SparkTech</title>
        <meta
          name="description"
          content="Review the terms and conditions for purchasing electronics, microcontrollers, robotics parts, and prototyping services at SparkTech."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            LEGAL &amp; COMPLIANCE
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Last updated: September 2026. Please read these terms carefully before placing orders or utilizing our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ paddingBlock: '3.5rem 4.5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>1. Overview &amp; Acceptance</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                This website and e-commerce portal is operated by SparkTech Technologies Pvt Ltd. By accessing our platform, purchasing microcontrollers, sensors, robotics parts, or commissioning rapid prototyping services, you agree to be bound by the following terms, condition policies, and notices stated herein.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>2. Technical Specifications &amp; Use Case</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                The components supplied by SparkTech are intended for educational experimentation, maker development, prototype research, and industrial automation. Users are responsible for adhering to electrical voltage limits, polarity guidelines, and ESD precautions as specified in the component datasheets. SparkTech is not liable for circuit burnouts caused by inverted polarity, over-voltage spikes, or electrostatic discharge induced by user error.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>3. Pricing &amp; GST Compliance</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                All prices are displayed in Indian Rupees (INR) and include transparent breakdowns of applicable Goods and Services Tax (GST). We reserve the right to correct typographical or system pricing errors without notice prior to dispatch.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>4. Order Cancellation &amp; Dead on Arrival (DOA)</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                Orders may be canceled without penalty prior to dispatch scanning. Once dispatched, our standard 7-day DOA replacement policy applies. Defective items reported within 7 days of verified courier delivery will be tested and replaced or refunded per customer preference.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>5. Intellectual Property</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                All trademarks, brand names, and logos appearing on this site (including Arduino, Raspberry Pi, Espressif, STMicroelectronics) are properties of their respective owners and are referenced solely for compatibility and identification purposes.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>6. Governing Jurisdiction</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                Any disputes arising in connection with the purchase of goods or services from SparkTech shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
