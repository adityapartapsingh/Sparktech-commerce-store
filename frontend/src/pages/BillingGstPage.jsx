import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FileCheck, Building, ArrowRight } from 'lucide-react';

export default function BillingGstPage() {
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>GST Invoicing &amp; Institutional Billing — SparkTech</title>
        <meta
          name="description"
          content="Learn how to obtain formal GST tax invoices with full Input Tax Credit (ITC) for your company, college, or Atal Tinkering Lab at SparkTech."
        />
      </Helmet>

      {/* Header */}
      <section style={{ paddingBlock: '3.5rem 2.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            TAX COMPLIANCE &amp; B2B
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem' }}>
            GST Invoicing &amp; Institutional Billing
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Claim 100% Input Tax Credit (ITC) on all electronic parts, development boards, and prototyping kits with compliant B2B invoicing.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ paddingBlock: '3.5rem 4.5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* How to add GSTIN */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Building size={22} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>How to Add Your GSTIN for ITC</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Claiming GST input tax credit for your startup, university department, or registered engineering enterprise is straightforward:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-blue)', marginBottom: '0.35rem' }}>Step 1: Enter Company Name</div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    During checkout or inside your Profile Settings, enter your registered business or institutional entity name.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-green)', marginBottom: '0.35rem' }}>Step 2: Enter 15-Digit GSTIN</div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Provide your valid GSTIN. Our system checks format validation to ensure proper filing on the GST portal.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>Step 3: Instant PDF Download</div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    As soon as your order completes, download an authentic PDF tax invoice with HSN codes, CGST/SGST/IGST breakdown.
                  </p>
                </div>
              </div>
            </div>

            {/* GST Rate Breakdown */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <FileCheck size={22} color="var(--accent-green)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>HSN Codes &amp; Standard Tax Rates</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Component Category</th>
                      <th style={{ padding: '0.75rem 1rem' }}>HSN Code</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Applicable GST Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>Microcontrollers &amp; Integrated Circuits (ICs)</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>8542 31 00</td>
                      <td style={{ padding: '0.75rem 1rem' }}>18% GST</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>Sensors, Transducers &amp; Measuring Breakouts</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>9031 80 00</td>
                      <td style={{ padding: '0.75rem 1rem' }}>18% GST</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>Electric Motors, Steppers &amp; BLDC Actuators</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>8501 10 19</td>
                      <td style={{ padding: '0.75rem 1rem' }}>18% GST</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>Robotics Educational &amp; Atal STEM Kits</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>9503 00 90</td>
                      <td style={{ padding: '0.75rem 1rem' }}>18% GST</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Institutional POs */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>University &amp; Enterprise Procurement</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Need to procure robotics kits or lab consumables via official institutional Purchase Orders, vendor empanelment, or customized quotation bids? Our enterprise desk provides direct Proforma Invoices and credit term processing.
              </p>
              <Link to="/support" className="btn btn-outline" style={{ gap: '0.5rem' }}>
                Request Institutional Quotation <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
