import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Truck, Cpu, Building2, ArrowRight, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1',  country: 'US', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+81', country: 'JP', label: 'Japan (+81)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
];

const HardwareOnboardingModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuthStore();
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [accountType, setAccountType] = useState(user?.accountType || 'maker');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number for courier dispatch.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim() || user?.name,
        phone: cleanPhone,
        accountType,
        gstin: gstin.trim() || undefined,
        isProfileComplete: true,
      };

      const res = await api.patch('/users/me', payload);
      const updatedUser = res.data?.data || { ...user, ...payload };
      setUser(updatedUser);

      // If user also entered shipping address info, add as default address
      if (pincode && city) {
        try {
          await api.post('/users/me/addresses', {
            label: accountType === 'lab' || accountType === 'business' ? 'Lab / Office' : 'Workbench',
            line1: `${city}, Pincode: ${pincode}`,
            city: city.trim(),
            state: 'India',
            pincode: pincode.trim(),
            country: 'India',
            phone: cleanPhone,
          });
        } catch {
          // Non-blocking address save
        }
      }

      toast.success('Hardware profile initialized! Ready for component dispatch.');
      if (onClose) onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(5, 8, 15, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="hardware-panel"
          style={{
            width: '100%',
            maxWidth: '540px',
            padding: '2rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* CAD Precision Crosshairs */}
          <span className="cad-crosshair top-left">+</span>
          <span className="cad-crosshair top-right">+</span>
          <span className="cad-crosshair bottom-left">+</span>
          <span className="cad-crosshair bottom-right">+</span>

          {/* Close / Dismiss */}
          <button
            onClick={onClose}
            type="button"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            title="Complete later"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge-telemetry emerald">
                <span className="pulse-dot" />
                INIT // GATEWAY_V4
              </span>
              <span className="badge-telemetry blue">COURIER TELEMETRY</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
              Complete Hardware Profile
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              Link your logistics contact for high-value silicon transit tracking, courier SMS dispatch, and institutional tax invoicing.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Full Name */}
            <div>
              <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Primary Contact Name</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>AUTO_SYNCED</span>
              </label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aditya Pratap Singh"
                required
              />
            </div>

            {/* Mobile Phone Number (Courier Dispatch Requirement) */}
            <div>
              <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Truck size={14} color="var(--accent-blue)" />
                  Courier Contact & Dispatch Phone
                </span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 600 }}>REQUIRED</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="input"
                  style={{ width: '130px', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.country} ({c.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="input"
                  style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace' }}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                  required
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Used for instant courier tracking via SMS & WhatsApp delivery verification.
              </p>
            </div>

            {/* Role / Entity Selector (Maker vs Lab) */}
            <div>
              <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Deployment Role & Purchasing Entity
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setAccountType('maker')}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${accountType === 'maker' ? 'var(--accent-blue)' : 'var(--border)'}`,
                    background: accountType === 'maker' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Cpu size={16} color={accountType === 'maker' ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Maker / Student
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Personal robotics, prototyping, breadboard components
                  </p>
                </div>

                <div
                  onClick={() => setAccountType('lab')}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${accountType === 'lab' ? 'var(--accent-blue)' : 'var(--border)'}`,
                    background: accountType === 'lab' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Building2 size={16} color={accountType === 'lab' ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Lab / Enterprise
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    B2B procurement, tax invoices & volume tiering
                  </p>
                </div>
              </div>
            </div>

            {/* Conditional / Optional GSTIN Input for B2B Input Credit */}
            {(accountType === 'lab' || accountType === 'business') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Entity GSTIN / Tax ID</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>
                    18% INPUT CREDIT
                  </span>
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}
                  placeholder="29AABCU9603R1ZM"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  maxLength={15}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Commercial invoices will be automatically generated with your entity GSTIN.
                </p>
              </motion.div>
            )}

            {/* Quick Delivery Pincode & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Delivery Pincode</label>
                <input
                  type="text"
                  className="input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div>
                <label className="label">City / Region</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              {isSubmitting ? (
                'Configuring Hardware Profile…'
              ) : (
                <>
                  <span>Save & Proceed to Workbench</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Compliance Guarantee */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
              }}
            >
              <Shield size={13} color="var(--accent-emerald)" />
              <span>Anti-Static ESD Safe Packaging // IPC-A-610 Verified Assembly</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HardwareOnboardingModal;
