import React from 'react';
import { useNavigate } from 'react-router-dom';

import { User, Mail, Shield, MapPin, Package, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left: Sidebar / Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#fff', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'Outfit,sans-serif' }}>
              {user.name?.charAt(0).toUpperCase() || <User size={48} />}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <Mail size={14} /> {user.email}
            </p>
            {user.role === 'admin' && (
              <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={12} /> Administrator
              </span>
            )}
            
            <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: '2rem', width: '100%', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
             <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}><Package size={18} color="var(--accent-blue)" /> My Orders</span>
               <ChevronRight size={16} color="var(--text-muted)" />
             </button>
             <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}><MapPin size={18} color="var(--accent-blue)" /> Saved Addresses</span>
               <ChevronRight size={16} color="var(--text-muted)" />
             </button>
          </div>
        </div>

        {/* Right: Personal Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
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
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
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

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled className="btn btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Edit Profile (Coming Soon)
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Address Book</h3>
            
            {user.addresses?.length > 0 ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {user.addresses.map((addr, i) => (
                   <div key={i} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                     <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{addr.label}</p>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                       {addr.line1}, {addr.city}<br />
                       {addr.state}, {addr.pincode}
                     </p>
                   </div>
                 ))}
               </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <MapPin size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any addresses yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
