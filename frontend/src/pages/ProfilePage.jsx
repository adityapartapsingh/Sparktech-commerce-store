import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User, Mail, Shield, MapPin, Package, LogOut, ChevronRight,
  Pencil, Phone, X, Plus, Trash2, Home, Building2, MapPinned,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

/* ── Label Icon Map ──────────────────────────────────── */
const LABEL_ICONS = {
  Home: Home,
  Work: Building2,
  Other: MapPinned,
};

/* ── Edit Profile Modal ──────────────────────────────── */
const EditProfileModal = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');

  const mutation = useMutation({
    mutationFn: (data) => api.patch('/users/me', data),
    onSuccess: (res) => {
      toast.success('Profile updated');
      onSaved(res.data.data);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update profile'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, phone });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" pattern="\d{10,15}" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Used for order notifications via SMS.</p>
          </div>
          <div>
            <label className="form-label">Email (read-only)</label>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
              {user.email}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Address Form Modal ──────────────────────────────── */
const LABELS = ['Home', 'Work', 'Other'];

const AddressFormModal = ({ address, onClose, onSaved }) => {
  const isEdit = !!address;
  const [form, setForm] = useState({
    label: address?.label || 'Home',
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    country: address?.country || 'India',
    phone: address?.phone || '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/users/me/addresses/${address._id}`, data)
        : api.post('/users/me/addresses', data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Address updated' : 'Address added');
      onSaved(res.data.data);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save address'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520, boxShadow: '0 24px 48px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Label picker */}
          <div>
            <label className="form-label">Address Label</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {LABELS.map(l => {
                const Icon = LABEL_ICONS[l] || MapPinned;
                const active = form.label === l;
                return (
                  <button key={l} type="button" onClick={() => set('label', l)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.45rem 1rem', borderRadius: 99,
                      border: `1.5px solid ${active ? 'var(--accent-blue)' : 'var(--border)'}`,
                      background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
                      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                    <Icon size={14} />{l}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="form-label">Address Line 1 *</label>
            <input type="text" className="form-input" required value={form.line1} onChange={e => set('line1', e.target.value)} placeholder="House no, street name" />
          </div>
          <div>
            <label className="form-label">Address Line 2</label>
            <input type="text" className="form-input" value={form.line2} onChange={e => set('line2', e.target.value)} placeholder="Landmark, area (optional)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">City *</label>
              <input type="text" className="form-input" required value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
            </div>
            <div>
              <label className="form-label">State *</label>
              <input type="text" className="form-input" required value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Pincode *</label>
              <input type="text" className="form-input" required minLength={4} maxLength={10} value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="400001" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" pattern="\d{10,15}" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Profile Page ───────────────────────────────── */
const ProfilePage = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [addressForm, setAddressForm] = useState(null);   // null = closed, {} = add, {addr} = edit

  const deleteMutation = useMutation({
    mutationFn: (addrId) => api.delete(`/users/me/addresses/${addrId}`),
    onSuccess: (res) => { toast.success('Address removed'); setUser(res.data.data); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      <Helmet>
        <title>My Profile | SparkTech</title>
        <meta name="description" content="Manage your SparkTech account, personal information, and saved addresses." />
      </Helmet>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and preferences.</p>
      </div>

      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

        {/* Left: Sidebar / Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#fff', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'Outfit,sans-serif' }}>
              {user.name?.charAt(0).toUpperCase() || <User size={48} />}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <Mail size={14} /> {user.email}
            </p>
            {user.phone && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Phone size={13} /> {user.phone}
              </p>
            )}
            {(user.role === 'admin' || user.role === 'masteradmin') && (
              <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Shield size={12} /> {user.role === 'masteradmin' ? 'Master Admin' : 'Administrator'}
              </span>
            )}

            <button onClick={() => setEditOpen(true)} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              <Pencil size={15} /> Edit Profile
            </button>
            <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
             <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}><Package size={18} color="var(--accent-blue)" /> My Orders</span>
               <ChevronRight size={16} color="var(--text-muted)" />
             </button>
             <button onClick={() => navigate('/wishlist')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}><MapPin size={18} color="var(--accent-blue)" /> Wishlist</span>
               <ChevronRight size={16} color="var(--text-muted)" />
             </button>
          </div>
        </div>

        {/* Right: Personal Info + Addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Personal Info Card */}
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Personal Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}>
                  {user.name}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {user.email}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem', color: user.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {user.phone || 'Not provided'}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', marginRight: '0.5rem' }} /> Active
                </div>
              </div>
            </div>
          </div>

          {/* Address Book */}
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Address Book</h3>
              <button onClick={() => setAddressForm({})} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}>
                <Plus size={16} /> Add Address
              </button>
            </div>

            {user.addresses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {user.addresses.map((addr) => {
                  const Icon = LABEL_ICONS[addr.label] || MapPinned;
                  return (
                    <div key={addr._id} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-blue)' }}>
                          <Icon size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {addr.label}
                            {addr.phone && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{addr.phone}</span>}
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                        <button onClick={() => setAddressForm(addr)} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.65rem', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 500 }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this address?')) deleteMutation.mutate(addr._id); }} disabled={deleteMutation.isPending} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.65rem', cursor: 'pointer', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 500 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <MapPin size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No saved addresses</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Add a shipping address to speed up your next checkout.</p>
                <button onClick={() => setAddressForm({})} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <Plus size={16} /> Add Your First Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editOpen && (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EditProfileModal user={user} onClose={() => setEditOpen(false)} onSaved={(u) => setUser(u)} />
          </motion.div>
        )}
        {addressForm !== null && (
          <motion.div key="address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AddressFormModal
              address={addressForm._id ? addressForm : null}
              onClose={() => setAddressForm(null)}
              onSaved={(u) => setUser(u)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
