import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', { name: data.name, email: data.email, password: data.password }),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success('Account created! Welcome to RoboMart ⚡');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', marginBottom:'1.5rem' }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg, var(--accent-blue), var(--accent-amber))', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={22} color="#0A0A0F" fill="#0A0A0F" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.5rem' }}>
              <span className="gradient-text">Robo</span><span style={{ color:'var(--text-primary)' }}>Mart</span>
            </span>
          </Link>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.8rem', marginBottom:'0.4rem' }}>Create account</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.95rem' }}>Join 50,000+ makers and engineers</p>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} className={`input ${errors.name ? 'error' : ''}`} placeholder="John Doe" autoComplete="name" />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email address</label>
              <input {...register('email')} type="email" className={`input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <input {...register('password')} type={showPass ? 'text' : 'password'} className={`input ${errors.password ? 'error' : ''}`} placeholder="Min. 8 characters" autoComplete="new-password" style={{ paddingRight:'3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input {...register('confirm')} type="password" className={`input ${errors.confirm ? 'error' : ''}`} placeholder="Re-enter password" autoComplete="new-password" />
              {errors.confirm && <p className="error-text">{errors.confirm.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'0.875rem', fontSize:'1rem', marginTop:'0.5rem' }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating account…' : 'Create Account ⚡'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem', color:'var(--text-muted)', fontSize:'0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent-blue)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
