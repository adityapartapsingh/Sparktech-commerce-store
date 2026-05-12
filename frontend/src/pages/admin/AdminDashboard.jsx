import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, IndianRupee, Package, AlertTriangle, ShieldPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

import api from '../../lib/axios';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ width: 56, height: 56, borderRadius: 12, background: `var(--bg-secondary)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      <Icon size={28} />
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</p>
      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.8rem', fontWeight: 700 }}>{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

  const createAdminMutation = useMutation({
    mutationFn: (newAdmin) => api.post('/admin/create-admin', newAdmin),
    onSuccess: () => {
      toast.success('Admin account created successfully');
      setAdminForm({ name: '', email: '', password: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  });

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    createAdminMutation.mutate(adminForm);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-blue)' }}
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--accent-red)' }}>Failed to load dashboard data. Are you an admin?</p>
      </div>
    );
  }

  const { stats, recentOrders, salesByStatus, lowStockProducts } = data;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const chartData = salesByStatus.map(s => ({ name: s._id.toUpperCase(), count: s.count }));

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of your store's performance.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="var(--accent-blue)" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="var(--accent-green)" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="var(--accent-amber)" />
        <StatCard title="Active Products" value={stats.totalProducts} icon={Package} color="var(--accent-purple)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Chart */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '2rem' }}>Orders by Status</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-secondary)' }}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} 
                />
                <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertTriangle color="var(--accent-red)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>All stock levels are healthy.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockProducts.slice(0, 6).map(prod => (
                prod.variants.filter(v => v.stock < 10).map((v, idx) => (
                  <div key={`${prod._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prod.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v.sku} | Variant: {v.stock}</p>
                    </div>
                    <span className="badge badge-red">{v.stock} left</span>
                  </div>
                ))
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Master Admin Controls */}
      {user?.role === 'masteradmin' && (
        <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', color: 'var(--accent-purple)' }}>
              <ShieldPlus size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-purple)' }}>Master Administrator Controls</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            As a master admin, you can create new administrator accounts to help manage the store.
          </p>
          
          <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Admin Name</label>
              <input type="text" className="form-input" required value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
              <input type="email" className="form-input" required value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} placeholder="jane@SparkTech.com" />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Initial Password</label>
              <input type="password" className="form-input" required minLength={8} value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={createAdminMutation.isPending} style={{ height: '42px' }}>
              {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      )}

      {/* Recent Orders Table */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Orders</h3>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Order ID</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Customer</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '1rem 0', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{order._id.slice(-8)}</td>
                <td style={{ padding: '1rem 0' }}>{order.user?.name || 'Unknown'}</td>
                <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '1rem 0' }}>
                  <span className={`badge badge-${order.status === 'paid' ? 'green' : order.status === 'pending' ? 'amber' : 'blue'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentOrders.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No recent orders.</p>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
