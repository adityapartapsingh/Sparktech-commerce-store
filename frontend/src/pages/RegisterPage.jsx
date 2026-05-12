import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, ShieldCheck, Github } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api, { apiBase as API_BASE } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  phone:    z.string().regex(/^\d{10,15}$/, 'Invalid numeric phone (e.g. 9876543210)').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

const otpSchema = z.object({
  emailOtp: z.string().length(6, 'Must be exactly 6 digits'),
  phoneOtp: z.string().length(6, 'Must be exactly 6 digits').optional().or(z.literal('')),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState('register');
  const [userId, setUserId] = useState(null);
  const [hasPhone, setHasPhone] = useState(false);

  const { register: regForm, handleSubmit: handleRegSubmit, formState: { errors: regErrors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const { register: otpForm, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      confirm: data.confirm,
    }),
    onSuccess: (res) => {
      setUserId(res.data.data.userId);
      setStep('otp');
      toast.success('Verification code sent! Check your backend terminal.');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (data) => api.post('/auth/verify-otp', {
      userId,
      emailOtp: data.emailOtp,
      phoneOtp: data.phoneOtp || undefined,
    }),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success('Account verified! Welcome to SparkTech');
      navigate('/');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
    },
  });

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };
  const handleGithubAuth = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const cardStyle = {
    background: 'var(--bg-card, #1a1a2e)',
    border: '1px solid var(--border, #2a2a4a)',
    borderRadius: 16,
    padding: '2rem',
  };

  const oauthBtnStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: 10,
    border: '1px solid var(--border, #2a2a4a)',
    background: 'var(--bg-elevated, #0f0f23)',
    color: 'var(--text-primary, #fff)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Helmet>
        <title>Create Account | SparkTech</title>
        <meta name="description" content="Join SparkTech to purchase premium electronic components." />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
              SparkTech
            </span>
          </Link>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.8rem', marginBottom: '0.4rem', color: 'var(--text-primary, #fff)' }}>
            {step === 'otp' ? 'Secure Verification' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.95rem' }}>
            {step === 'otp' ? 'Enter the verification code sent to your email' : 'Join 50,000+ makers and engineers'}
          </p>
        </div>

        <div style={cardStyle}>
          {step === 'register' ? (
            <form onSubmit={handleRegSubmit((d) => { setHasPhone(!!d.phone); registerMutation.mutate(d); })} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Name */}
              <div>
                <label className="label">Full Name *</label>
                <input {...regForm('name')} className={`input ${regErrors.name ? 'error' : ''}`} placeholder="John Doe" autoComplete="name" />
                {regErrors.name && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{regErrors.name.message}</p>}
              </div>

              {/* Email + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Email *</label>
                  <input {...regForm('email')} type="email" className={`input ${regErrors.email ? 'error' : ''}`} placeholder="you@example.com" autoComplete="email" />
                  {regErrors.email && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{regErrors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Phone (optional)</label>
                  <input {...regForm('phone')} type="tel" className={`input ${regErrors.phone ? 'error' : ''}`} placeholder="9876543210" autoComplete="tel" />
                  {regErrors.phone && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{regErrors.phone.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input {...regForm('password')} type={showPass ? 'text' : 'password'} className={`input ${regErrors.password ? 'error' : ''}`} placeholder="Min. 8 characters" autoComplete="new-password" style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #888)' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regErrors.password && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{regErrors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input {...regForm('confirm')} type={showConfirm ? 'text' : 'password'} className={`input ${regErrors.confirm ? 'error' : ''}`} placeholder="Re-enter password" autoComplete="new-password" style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #888)' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regErrors.confirm && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{regErrors.confirm.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Sending code…' : 'Continue to Verification'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted, #888)', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border, #2a2a4a)' }} />
                <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border, #2a2a4a)' }} />
              </div>

              {/* OAuth Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={handleGoogleAuth} style={oauthBtnStyle}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button type="button" onClick={handleGithubAuth} style={oauthBtnStyle}>
                  <Github size={20} />
                  GitHub
                </button>
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted, #888)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent-blue, #00d4ff)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit((d) => verifyMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent-blue, #00d4ff)' }}>
                <ShieldCheck size={48} style={{ opacity: 0.85 }} />
              </div>

              <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '0.875rem', fontSize: '0.85rem', color: 'var(--text-secondary, #ccc)', lineHeight: 1.6 }}>
                <strong>Development Mode:</strong> OTPs are printed to the <strong>backend Node.js terminal</strong>.<br/>
                Look for lines like: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>[MOCK EMAIL SERVICE] → Sent OTP [123456]</code>
              </div>

              {/* Email OTP */}
              <div>
                <label className="label">Email Verification Code</label>
                <input {...otpForm('emailOtp')} type="text" maxLength={6} inputMode="numeric" className={`input ${otpErrors.emailOtp ? 'error' : ''}`} placeholder="6-digit code" style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.4rem', fontWeight: 700 }} />
                {otpErrors.emailOtp && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{otpErrors.emailOtp.message}</p>}
              </div>

              {/* Phone OTP — only shown if user provided a phone */}
              {hasPhone && (
                <div>
                  <label className="label">Phone SMS Code</label>
                  <input {...otpForm('phoneOtp')} type="text" maxLength={6} inputMode="numeric" className={`input ${otpErrors.phoneOtp ? 'error' : ''}`} placeholder="6-digit code" style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.4rem', fontWeight: 700 }} />
                  {otpErrors.phoneOtp && <p className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{otpErrors.phoneOtp.message}</p>}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} disabled={verifyMutation.isPending}>
                {verifyMutation.isPending ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button type="button" onClick={() => setStep('register')} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #888)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center' }}>
                ← Go back and edit details
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
