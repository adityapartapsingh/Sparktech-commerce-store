import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserCheck, Mail, IndianRupee, Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { exportData } from '../../lib/exportData';

const AdminCustomersPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: async () => {
      const res = await api.get('/users', { params: { page, limit: 10 } });
      return res.data;
    },
    enabled: !!user,
    keepPreviousData: true
  });

  const customers = pageData?.data?.customers || [];

  // Filter visually by search term
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async (format) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const headers = ['Name', 'Email', 'Phone', 'Joined', 'Total Orders', 'Lifetime Value (INR)', 'Role'];
      const rows = filteredCustomers.map(c => [
        c.name || '',
        c.email || '',
        c.phone || '',
        new Date(c.createdAt).toLocaleDateString('en-IN'),
        c.stats?.totalOrders || 0,
        c.stats?.totalSpent || 0,
        c.role || 'customer',
      ]);
      await exportData({ format, filename: 'SparkTech_customers', title: 'SparkTech — Customer Report', headers, rows });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };


  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Customer Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Central repository of registered store users and lifetime metrics.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(v => !v)}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <Download size={16} />
            {exporting ? 'Exporting…' : 'Export'}
            <ChevronDown size={14} />
          </button>
          {exportOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', minWidth: 160, zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              {[['excel', 'Excel (.xlsx)'], ['csv', 'CSV']].map(([fmt, label]) => (
                <button key={fmt} onClick={() => handleExport(fmt)} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              className="input" 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Customer Details</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Registration Date</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Total Orders</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Lifetime Value (LTV)</th>
                <th style={{ padding: '1rem 0', fontWeight: 500, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading Customer Registry...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customers found.</td></tr>
              ) : filteredCustomers.map(customer => (
                <tr key={customer._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '1.1rem' }}>
                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                          <Mail size={10} /> {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>
                    {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.2rem 0.6rem', borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{customer.stats?.totalOrders || 0}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Orders</span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '1rem 0' }}>
                     <div style={{ fontWeight: 600, color: 'var(--accent-green)', display: 'flex', alignItems: 'center' }}>
                       <IndianRupee size={14} style={{ marginRight: 2 }} />
                       {customer.stats?.totalSpent?.toLocaleString('en-IN') || 0}
                     </div>
                  </td>
                  
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: 500, background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                      <UserCheck size={14} /> Active
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData?.data?.pagination && pageData.data.pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.5rem' }}>
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: pageData.data.pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pageData.data.pagination.totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--text-muted)' }}>…</span>}
                  <button className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)} style={{ minWidth: 40, height: 40, padding: 0 }}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button className="btn btn-outline" disabled={page >= pageData.data.pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.5rem' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
