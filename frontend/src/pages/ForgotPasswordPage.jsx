import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, ArrowLeft, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/forgot-password', { email: data.email }),
    onSuccess: () => {
      toast.success('If this email exists, a reset link has been sent. Check your inbox!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <Helmet>
        <title>Forgot Password | SparkTech</title>
        <meta name="description" content="Reset your SparkTech account password." />
      </Helmet>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
              SparkTech
            </span>
          </Link>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.8rem', marginBottom: '0.4rem' }}>Forgot Password?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {mutation.isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Mail size={28} color="var(--accent-green)" />
              </div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Check Your Email</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                If an account with that email exists, we've sent a password reset link. It expires in 30 minutes.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">Email Address</label>
                <input {...register('email')} type="email" className={`input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" autoComplete="email" autoFocus />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
              </button>

              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
