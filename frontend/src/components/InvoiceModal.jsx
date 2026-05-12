import React from 'react';
import { X, Download, Printer, CheckCircle2, Package } from 'lucide-react';

/**
 * InvoiceModal
 * Props: order, onClose, isAdmin
 * Both admin and customer get Download PDF.
 * Only admin gets Print.
 * ₹ is used in HTML (browser renders it fine).
 * Rs. is used in jsPDF (Helvetica can't render ₹ glyph).
 */
const InvoiceModal = ({ order, onClose, isAdmin = false }) => {
  if (!order) return null;

  const invoiceNo = `INV-${order._id.slice(-8).toUpperCase()}`;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const tax = Math.round(subtotal * 0.18);
  const shipping = order.totalAmount - subtotal - tax > 0 ? order.totalAmount - subtotal - tax : 0;
  const payMethod = order.paymentInfo?.method === 'cod' ? 'Cash on Delivery' : 'Online / Razorpay';

  /* ── Print (admin only) ── */
  const handlePrint = () => {
    const el = document.getElementById('invoice-printable');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${invoiceNo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 2cm; }
        .logo { font-size: 1.6rem; font-weight: 900; color: #00d4ff; margin-bottom: 0.25rem; }
        .row  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        th { background: #0a0a1a; color: #00d4ff; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.8rem; }
        td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #e5e5e5; font-size: 0.85rem; }
        .total-row { font-weight: 700; background: #f5f5f5; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600;
                  background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .footer { margin-top: 3rem; font-size: 0.75rem; color: #888; text-align: center; border-top: 1px solid #e5e5e5; padding-top: 1rem; }
      </style></head>
      <body>${el.innerHTML}</body></html>`);
    w.document.close(); w.focus(); w.print(); w.close();
  };

  /* ── Download PDF (for everyone) ── */
  const handleDownload = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.setFontSize(22); doc.setTextColor(0, 212, 255);
    doc.text('SparkTech', 40, 50);
    doc.setFontSize(9); doc.setTextColor(100, 100, 120);
    doc.text('SparkTech.com  |  support@SparkTech.com', 40, 63);
    doc.setFontSize(20); doc.setTextColor(30, 30, 50);
    doc.text('INVOICE', 500, 50, { align: 'right' });
    doc.setFontSize(9); doc.setTextColor(100, 100, 120);
    doc.text(invoiceNo, 500, 63, { align: 'right' });
    doc.text(`Date: ${date}`, 500, 75, { align: 'right' });

    const addr = order.shippingAddress;
    doc.setFontSize(9); doc.setTextColor(60, 60, 80);
    doc.text('Bill To:', 40, 100);
    doc.setFontSize(10); doc.setTextColor(20, 20, 40);
    doc.text(order.user?.name || 'Customer', 40, 113);
    doc.setFontSize(9); doc.setTextColor(80, 80, 100);
    if (order.user?.email) doc.text(order.user.email, 40, 124);
    if (addr) doc.text(`${addr.line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`, 40, 135);
    doc.text(`Payment: ${payMethod}`, 40, 146);

    autoTable(doc, {
      startY: 162,
      head: [['#', 'Item', 'Variant', 'Qty', 'Unit Price', 'Total']],
      body: order.items?.map((item, i) => [
        i + 1, item.name, item.variantLabel || '-', item.quantity,
        `Rs.${item.price.toLocaleString('en-IN')}`,
        `Rs.${(item.price * item.quantity).toLocaleString('en-IN')}`,
      ]),
      headStyles: { fillColor: [0, 60, 80], textColor: [0, 212, 255], fontSize: 8 },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 248, 252] },
    });

    const y = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(9); doc.setTextColor(80);
    const totals = [
      ['Subtotal', `Rs.${subtotal.toLocaleString('en-IN')}`],
      ['GST (18%)', `Rs.${tax.toLocaleString('en-IN')}`],
      ...(shipping > 0 ? [['Shipping', `Rs.${shipping.toLocaleString('en-IN')}`]] : []),
    ];
    totals.forEach(([label, val], i) => {
      doc.text(label, 380, y + i * 14);
      doc.text(val, 500, y + i * 14, { align: 'right' });
    });
    const totalY = y + totals.length * 14 + 10;
    doc.setFontSize(12); doc.setTextColor(0, 100, 200);
    doc.text('TOTAL', 380, totalY);
    doc.text(`Rs.${order.totalAmount?.toLocaleString('en-IN')}`, 500, totalY, { align: 'right' });
    doc.setFontSize(8); doc.setTextColor(140);
    doc.text('Thank you for shopping with SparkTech!', 40, totalY + 30);
    doc.save(`${invoiceNo}.pdf`);
  };

  return (
    <>
      {/* Hidden printable invoice */}
      <div id="invoice-printable" style={{ display: 'none' }}>
        <div className="row">
          <div>
            <div className="logo">SparkTech</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>SparkTech.com | support@SparkTech.com</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>INVOICE</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{invoiceNo}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{date}</div>
          </div>
        </div>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>BILL TO</div>
            <strong>{order.user?.name || 'Customer'}</strong>
            {order.user?.email && <div style={{ fontSize: '0.82rem' }}>{order.user.email}</div>}
            {order.shippingAddress && (
              <div style={{ fontSize: '0.82rem', color: '#555' }}>
                {order.shippingAddress.line1}, {order.shippingAddress.city},<br />
                {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>STATUS</div>
            <span className="badge">{order.status?.toUpperCase()}</span>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Payment</div>
            <div style={{ fontSize: '0.82rem' }}>{payMethod}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Item</th><th>Variant</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td><td>{item.name}</td><td>{item.variantLabel || '—'}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price.toLocaleString('en-IN')}</td>
                <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            <tr><td colSpan="5" style={{ textAlign: 'right', color: '#555' }}>Subtotal</td><td>₹{subtotal.toLocaleString('en-IN')}</td></tr>
            <tr><td colSpan="5" style={{ textAlign: 'right', color: '#555' }}>GST (18%)</td><td>₹{tax.toLocaleString('en-IN')}</td></tr>
            {shipping > 0 && <tr><td colSpan="5" style={{ textAlign: 'right', color: '#555' }}>Shipping</td><td>₹{shipping.toLocaleString('en-IN')}</td></tr>}
            <tr className="total-row"><td colSpan="5" style={{ textAlign: 'right' }}>TOTAL</td><td>₹{order.totalAmount?.toLocaleString('en-IN')}</td></tr>
          </tbody>
        </table>
        <div className="footer">Thank you for shopping with SparkTech! · support@SparkTech.com</div>
      </div>

      {/* Modal Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem' }}>Invoice</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{invoiceNo} · {date}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Download for everyone */}
              <button onClick={handleDownload} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                <Download size={15} /> Download PDF
              </button>
              {/* Print only for admin */}
              {isAdmin && (
                <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                  <Printer size={15} /> Print
                </button>
              )}
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Invoice body */}
          <div style={{ padding: '2rem 1.5rem' }}>
            {/* Brand header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>S</div>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    SparkTech
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SparkTech.com · support@SparkTech.com</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.05em' }}>INVOICE</p>
                <p style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{invoiceNo}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{date}</p>
              </div>
            </div>

            {/* Bill To + Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Bill To</p>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>{order.user?.name || 'Customer'}</p>
                {order.user?.email && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{order.user.email}</p>}
                {order.shippingAddress && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    {order.shippingAddress.line1}, {order.shippingAddress.city},<br />
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Status</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle2 size={13} /> {order.status?.toUpperCase()}
                </span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Payment</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{payMethod}</p>
              </div>
            </div>

            {/* Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '2px solid var(--border)' }}>
                  {['#', 'Product', 'Variant', 'Qty', 'Unit Price', 'Total'].map(h => (
                    <th key={h} style={{ padding: '0.75rem', textAlign: h === '#' || h === 'Qty' ? 'center' : h === 'Unit Price' || h === 'Total' ? 'right' : 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 0.75rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                          : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="var(--text-muted)" /></div>}
                        <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.variantLabel || '—'}</td>
                    <td style={{ padding: '0.875rem 0.75rem', textAlign: 'center', fontSize: '0.88rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', fontSize: '0.88rem' }}>₹{item.price.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', fontWeight: 600, fontSize: '0.88rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 260 }}>
                {[
                  ['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
                  ['GST (18%)', `₹${tax.toLocaleString('en-IN')}`],
                  ...(shipping > 0 ? [['Shipping', `₹${shipping.toLocaleString('en-IN')}`]] : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <span>{label}</span><span>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-blue)' }}>
                  <span>TOTAL</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              Thank you for shopping with SparkTech! · support@SparkTech.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceModal;
