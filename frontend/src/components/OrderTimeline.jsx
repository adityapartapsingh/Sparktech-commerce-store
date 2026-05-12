import React from 'react';
import { CheckCircle2, Circle, Clock, Package, Truck, Star, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'pending',    label: 'Order Placed',      icon: Clock },
  { key: 'paid',       label: 'Payment Confirmed',  icon: CheckCircle2 },
  { key: 'processing', label: 'Processing',         icon: Package },
  { key: 'shipped',    label: 'Shipped',            icon: Truck },
  { key: 'delivered',  label: 'Delivered',          icon: Star },
];

const STATUS_IDX = {
  pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4,
  cancelled: -1, refunded: -1,
};

/**
 * OrderTimeline — visual progress stepper.
 * The connector line runs only between circle centres (10% → 90% for 5 steps).
 * No line extension past the last step.
 */
const OrderTimeline = ({ status }) => {
  const currentIdx = STATUS_IDX[status] ?? 0;
  const isCancelled = status === 'cancelled' || status === 'refunded';
  const n = STEPS.length;

  // Circle centres land at 1/(2n), 3/(2n), 5/(2n)… of the container width.
  const pct = (i) => `${((2 * i + 1) / (2 * n)) * 100}%`;

  // Background line: first centre → last centre
  const lineLeft  = pct(0);         // 10% for 5 steps
  const lineRight = `${100 - ((2 * (n - 1) + 1) / (2 * n)) * 100}%`; // mirror of last

  // Active fill: first centre → current centre
  const fillWidth =
    currentIdx === 0
      ? 0
      : `calc(${pct(currentIdx)} - ${lineLeft})`;

  if (isCancelled) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '0.75rem' }}>
        <XCircle size={18} color="var(--accent-red)" />
        <span style={{ fontSize: '0.875rem', color: 'var(--accent-red)', fontWeight: 600 }}>
          Order {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0 0.5rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>

        {/* Background connector — runs only between first and last circle centres */}
        <div style={{
          position: 'absolute', top: 16, left: lineLeft, right: lineRight, height: 2,
          background: 'var(--border)', zIndex: 0,
        }} />

        {/* Active fill — from first centre to current circle centre */}
        <div style={{
          position: 'absolute', top: 16, left: lineLeft, height: 2,
          width: fillWidth,
          background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))',
          transition: 'width 0.4s ease',
          zIndex: 1,
        }} />

        {STEPS.map((step, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          const Icon   = step.icon;
          return (
            <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--accent-green)' : active ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                border: `2px solid ${done ? 'var(--accent-green)' : active ? 'var(--accent-blue)' : 'var(--border)'}`,
                boxShadow: active ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {done
                  ? <CheckCircle2 size={16} color="#fff" />
                  : active
                    ? <Icon size={16} color="#fff" />
                    : <Circle size={16} color="var(--text-muted)" style={{ opacity: 0.4 }} />}
              </div>
              <p style={{
                marginTop: '0.4rem', fontSize: '0.7rem',
                fontWeight: active ? 700 : done ? 500 : 400,
                color: done ? 'var(--accent-green)' : active ? 'var(--accent-blue)' : 'var(--text-muted)',
                textAlign: 'center', lineHeight: 1.3,
              }}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
