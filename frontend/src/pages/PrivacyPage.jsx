import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Privacy Policy — SparkTech</title>
        <meta
          name="description"
          content="Learn how SparkTech safeguards your personal information, delivery addresses, payment security, and technical communication."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            DATA SECURITY &amp; TRUST
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Your privacy and intellectual property are respected. Learn how your data is protected at SparkTech.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ paddingBlock: '3.5rem 4.5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>1. Information We Collect</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                When you create an account, request a prototyping quote, or purchase hardware components, we collect necessary contact information (name, email address, phone number, delivery address, and optionally your organization name and GSTIN for tax invoicing).
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>2. Payment Card &amp; Financial Security</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                We <strong>do not store</strong> your debit/credit card numbers, CVVs, UPI PINs, or netbanking credentials on our servers. All financial transactions are processed securely through PCI-DSS Level 1 certified payment gateways (Razorpay) using 256-bit SSL/TLS encryption.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>3. Prototyping Files &amp; Intellectual Property (IP)</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                When you upload Gerber files, 3D STL models, or schematics for custom fabrication services, your design files remain 100% your proprietary intellectual property. We sign standard NDAs on request and never share your engineering files with third-party vendors.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>4. Cookies &amp; Session Management</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                We utilize essential HTTP-only cookies and local storage tokens strictly to maintain your logged-in session, remember your shopping cart items, and preserve your theme preference (Dark/Light). We do not sell your personal data to ad trackers.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>5. Contact Our Data Protection Officer</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                For data deletion requests or inquiries regarding your stored information, please email us directly at <strong>privacy@sparktech.in</strong>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
