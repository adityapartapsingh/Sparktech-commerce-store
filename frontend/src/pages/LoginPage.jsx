import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, Github } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

// CRA uses process.env.REACT_APP_* (not import.meta.env)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const schema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  password:   z.string().min(1, 'Password required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const registerForm = useForm({ resolver: zodResolver(schema) });
  const { register, handleSubmit, formState: { errors } } = registerForm;

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', { identifier: data.identifier, password: data.password }),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success(`🎉 Welcome back, ${res.data.data.name}! ⚡`);
      const role = res.data.data.role;
      navigate((role === 'admin' || role === 'masteradmin') ? '/admin/dashboard' : '/');
    },
    onError: (err) => {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Login failed';
      if (status === 403) toast.error('⚠️ Account not verified. Please register again to get a new OTP.');
      else if (status === 401) toast.error('❌ Invalid email/phone or password.');
      else toast.error(`❌ ${msg}`);
    },
  });

  const handleGoogleAuth = () => window.location.href = `${API_BASE}/auth/google`;
  const handleGithubAuth = () => window.location.href = `${API_BASE}/auth/github`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <Helmet>
        <title>Login | RoboMart</title>
        <meta name="description" content="Sign in to your RoboMart account to track orders, manage addresses, and access exclusive hardware deals." />
      </Helmet>
      {/* Background glow */}
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', marginBottom:'1.5rem' }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg, var(--accent-blue), var(--accent-amber))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={22} color="#0A0A0F" fill="#0A0A0F" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.5rem' }}>
              <span className="gradient-text">Robo</span><span style={{ color:'var(--text-primary)' }}>Mart</span>
            </span>
          </Link>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.8rem', marginBottom:'0.4rem' }}>Welcome back</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.95rem' }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label className="label">Email or Phone Number</label>
              <input {...register('identifier')} type="text" className={`input ${errors.identifier ? 'error' : ''}`} placeholder="you@example.com OR 9876543210" autoComplete="username" />
              {errors.identifier && <p className="error-text">{errors.identifier.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <input {...register('password')} type={showPass ? 'text' : 'password'} className={`input ${errors.password ? 'error' : ''}`} placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
              <div style={{ textAlign:'right', marginTop:'0.4rem' }}>
                <Link to="/forgot-password" style={{ fontSize:'0.82rem', color:'var(--accent-blue)', textDecoration:'none' }}>Forgot password?</Link>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'0.875rem', fontSize:'1rem', marginTop:'0.5rem' }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in…' : 'Sign In ⚡'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={handleGoogleAuth} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button type="button" onClick={handleGithubAuth} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                <Github size={20} />
                GitHub
              </button>
            </div>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem', color:'var(--text-muted)', fontSize:'0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent-blue)', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
