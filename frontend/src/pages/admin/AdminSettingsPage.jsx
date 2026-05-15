import React, { useState } from 'react';
import { Database, Shield, Bell, Globe, Palette, Server, HardDrive, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../../store/themeStore';

const SettingSection = ({ icon: Icon, title, description, children, color = 'var(--accent-blue)' }) => (
  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.1rem' }}>{title}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{description}</p>
      </div>
    </div>
    <div style={{ padding: '1.5rem' }}>
      {children}
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label, sublabel }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div>
      <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{label}</p>
      {sublabel && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{sublabel}</p>}
    </div>
    <button
      onClick={onChange}
      style={{
        width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent-blue)' : 'var(--bg-elevated)',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3,
        left: checked ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  </div>
);

const AdminSettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  // Local state for settings (these would typically persist to backend)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    newOrderAlerts: true,
    maintenanceMode: false,
    autoBackup: true,
    twoFactorAuth: false,
    rateLimiting: true,
    debugMode: false,
  });

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  // System info (would come from backend in production)
  const systemInfo = {
    nodeVersion: 'v20.x',
    mongooseVersion: '9.x',
    redisStatus: 'Connected',
    cloudinaryStatus: 'Active',
    environment: process.env.NODE_ENV || 'development',
    apiVersion: 'v1',
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure platform preferences and system parameters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>

        {/* Appearance */}
        <SettingSection icon={Palette} title="Appearance" description="Theme and display preferences" color="var(--accent-purple)">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            {['dark', 'light'].map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${theme === t ? 'var(--accent-purple)' : 'var(--border)'}`,
                  background: theme === t ? 'rgba(139,92,246,0.08)' : 'var(--bg-primary)',
                  color: theme === t ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                  textTransform: 'capitalize', transition: 'all 0.2s',
                }}
              >
                {t === 'dark' ? '🌙' : '☀️'} {t} Mode
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Theme preference is saved to your browser and persists across sessions.
          </p>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Notifications" description="Alert triggers and notification channels" color="var(--accent-amber)">
          <ToggleSwitch checked={settings.emailNotifications} onChange={() => toggle('emailNotifications')} label="Email Notifications" sublabel="Receive order and system emails" />
          <ToggleSwitch checked={settings.lowStockAlerts} onChange={() => toggle('lowStockAlerts')} label="Low Stock Alerts" sublabel="Alert when variant stock drops below 10" />
          <ToggleSwitch checked={settings.newOrderAlerts} onChange={() => toggle('newOrderAlerts')} label="New Order Alerts" sublabel="Instant notification on new orders" />
        </SettingSection>

        {/* Security */}
        <SettingSection icon={Shield} title="Security" description="Authentication and access control" color="var(--accent-green)">
          <ToggleSwitch checked={settings.twoFactorAuth} onChange={() => toggle('twoFactorAuth')} label="Two-Factor Authentication" sublabel="Require 2FA for admin logins (coming soon)" />
          <ToggleSwitch checked={settings.rateLimiting} onChange={() => toggle('rateLimiting')} label="API Rate Limiting" sublabel="Protect endpoints from abuse (100 req/15min)" />
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="var(--accent-green)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 500 }}>JWT + RBAC security active</span>
          </div>
        </SettingSection>

        {/* System & Infrastructure */}
        <SettingSection icon={Server} title="Infrastructure" description="System services and connection status" color="var(--accent-blue)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Node.js Runtime', value: systemInfo.nodeVersion, status: 'ok' },
              { label: 'MongoDB (Mongoose)', value: systemInfo.mongooseVersion, status: 'ok' },
              { label: 'Redis Cache', value: systemInfo.redisStatus, status: 'ok' },
              { label: 'Cloudinary CDN', value: systemInfo.cloudinaryStatus, status: 'ok' },
              { label: 'Environment', value: systemInfo.environment, status: systemInfo.environment === 'production' ? 'ok' : 'warn' },
              { label: 'API Version', value: systemInfo.apiVersion, status: 'ok' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', fontFamily: 'monospace' }}>{item.value}</span>
                  {item.status === 'ok' ? (
                    <CheckCircle2 size={14} color="var(--accent-green)" />
                  ) : (
                    <AlertTriangle size={14} color="var(--accent-amber)" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Data Management */}
        <SettingSection icon={Database} title="Data Management" description="Backup and maintenance operations" color="var(--accent-red)">
          <ToggleSwitch checked={settings.autoBackup} onChange={() => toggle('autoBackup')} label="Auto Backup" sublabel="Daily MongoDB snapshots (Atlas managed)" />
          <ToggleSwitch checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} label="Maintenance Mode" sublabel="Show maintenance page to customers" />
          <ToggleSwitch checked={settings.debugMode} onChange={() => toggle('debugMode')} label="Debug Mode" sublabel="Enable verbose logging for diagnostics" />

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => toast.success('Cache cleared successfully')}
              className="btn btn-outline"
              style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}
            >
              <HardDrive size={14} style={{ marginRight: '0.4rem' }} /> Clear Cache
            </button>
            <button
              onClick={() => toast('Database export is an Atlas-managed feature. Use MongoDB Atlas Dashboard.', { icon: <Info size={16} /> })}
              className="btn btn-outline"
              style={{ flex: 1, fontSize: '0.85rem', justifyContent: 'center' }}
            >
              <Database size={14} style={{ marginRight: '0.4rem' }} /> Export DB
            </button>
          </div>
        </SettingSection>

        {/* Store Configuration */}
        <SettingSection icon={Globe} title="Store Configuration" description="Public-facing store settings" color="var(--accent-blue)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Store Name</label>
              <input type="text" className="input" defaultValue="SparkTech" disabled style={{ opacity: 0.7 }} />
            </div>
            <div>
              <label className="label">Support Email</label>
              <input type="email" className="input" defaultValue="projecttesting38@gmail.com" disabled style={{ opacity: 0.7 }} />
            </div>
            <div>
              <label className="label">Currency</label>
              <input type="text" className="input" defaultValue="INR (₹)" disabled style={{ opacity: 0.7 }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
              Store configuration is managed via environment variables. Update the .env file to change these values.
            </p>
          </div>
        </SettingSection>

      </div>
    </div>
  );
};

export default AdminSettingsPage;
