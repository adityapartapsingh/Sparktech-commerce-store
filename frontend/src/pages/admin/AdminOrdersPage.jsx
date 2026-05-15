import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Download, ChevronDown, ChevronUp, FileText, Truck, ExternalLink, Eye, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { exportData } from '../../lib/exportData';
import InvoiceModal from '../../components/InvoiceModal';
import OrderTimeline from '../../components/OrderTimeline';
import { X } from 'lucide-react';

/* ── Dispatch Modal ────────────────────────────────────────── */
const DispatchModal = ({ order, onClose, onSubmit, isPending }) => {
  const [provider, setProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ provider, trackingNumber, trackingUrl });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 460, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Dispatch Order</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={20} /></button>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          You're marking order #{order._id.slice(-8).toUpperCase()} as <strong>Shipped</strong>. Please provide tracking details for the customer.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Courier / Provider *</label>
            <input required type="text" className="input" placeholder="e.g. Delhivery, BlueDart" value={provider} onChange={e => setProvider(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tracking Number</label>
            <input type="text" className="input" placeholder="AWB Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tracking URL</label>
            <input type="url" className="input" placeholder="https://" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isPending || !provider} className="btn btn-primary">
              {isPending ? 'Saving...' : 'Confirm Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Order Detail Modal ────────────────────────────────────── */
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Order Details</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>#{order._id}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
             <div>
               <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer Info</h4>
               <p style={{ fontWeight: 600 }}>{order.user?.name || 'Guest'}</p>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.user?.email}</p>
             </div>
             <div>
               <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Shipping Address</h4>
               {order.shippingAddress ? (
                 <div style={{ fontSize: '0.9rem' }}>
                   {order.shippingAddress.label && <p style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{order.shippingAddress.label}</p>}
                   <p>{order.shippingAddress.line1}</p>
                   {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                   <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                   <p>{order.shippingAddress.country || 'India'}</p>
                   {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                 </div>
               ) : <p style={{ color: 'var(--text-muted)' }}>No shipping info</p>}
             </div>
           </div>
           
           <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Order Items</h4>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
             {order.items?.map((item, idx) => (
               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   {item.image ? <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, borderRadius: 6, background: 'var(--bg-secondary)' }} />}
                   <div>
                     <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Variant SKU: {item.sku}</p>
                   </div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <p style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</p>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity}</p>
                 </div>
               </div>
             ))}
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment</h4>
                <p>Method: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentInfo?.method}</span></p>
                <p>Status: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentInfo?.status}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Subtotal: ₹{(order.totalAmount - (order.shippingFee || 0)).toLocaleString('en-IN')}</p>
                <p style={{ color: 'var(--text-secondary)' }}>Shipping: ₹{order.shippingFee?.toLocaleString('en-IN') || 0}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>Total: ₹{order.totalAmount?.toLocaleString('en-IN')}</h3>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [viewDetailOrder, setViewDetailOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [returnNote, setReturnNote] = useState({});
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

  const toggleExpand = (id) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { status: statusFilter, limit: 100 } });
      return res.data;
    }
  });

  const orders = pageData?.data?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries(['admin-orders']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
  });

  const dispatchMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/orders/${id}/delivery`, payload),
    onSuccess: () => {
      toast.success('Order dispatched & tracking saved');
      setDispatchOrder(null);
      queryClient.invalidateQueries(['admin-orders']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save delivery info')
  });

  const returnUpdateMutation = useMutation({
    mutationFn: ({ orderId, status, adminNote }) => api.patch(`/admin/returns/${orderId}`, { status, adminNote }),
    onSuccess: () => {
      toast.success('Return request updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update return request')
  });

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'shipped') {
      setDispatchOrder(order);
    } else {
      updateStatusMutation.mutate({ id: order._id, status: newStatus });
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;
    
    // We only support non-shipped bulk updates via this simple method for now,
    // since shipped requires tracking info per order.
    if (bulkStatus === 'shipped') {
      return toast.error("Cannot bulk update to 'Shipped' because tracking details are required per order.");
    }

    const orderIds = Array.from(selectedOrders);
    try {
      await Promise.all(orderIds.map(id => api.patch(`/orders/${id}/status`, { status: bulkStatus })));
      toast.success(`Successfully updated ${selectedOrders.size} orders to ${bulkStatus}`);
      setSelectedOrders(new Set());
      setBulkStatus('');
      queryClient.invalidateQueries(['admin-orders']);
    } catch (err) {
      toast.error('Some orders failed to update.');
    }
  };

  const handleExport = async (format) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const headers = ['Order ID', 'Date', 'Customer', 'Email', 'City', 'Total (INR)', 'Status', 'Items'];
      const rows = filteredOrders.map(o => [
        `#${o._id.slice(-8).toUpperCase()}`,
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.user?.name || 'Guest',
        o.user?.email || '',
        o.shippingAddress ? `${o.shippingAddress.city}, ${o.shippingAddress.state}` : '',
        o.totalAmount || 0,
        o.status,
        o.items?.length || 0,
      ]);
      await exportData({ format, filename: 'SparkTech_orders', title: 'SparkTech — Orders Report', headers, rows });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'var(--accent-blue)';
      case 'processing': return 'var(--accent-amber)';
      case 'shipped': return 'var(--accent-purple)';
      case 'delivered': return 'var(--accent-green)';
      case 'cancelled': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  // Filter visually by search term
  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectOrder = (id) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Global Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage fulfillment states and shipping logistics.</p>
        </div>
        {/* Export Dropdown */}
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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..." 
              className="input" 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', flex: 2, minWidth: 300 }}>
            {[{v:'', l:'All Orders'}, {v:'pending', l:'Pending'}, {v:'paid', l:'Paid'}, {v:'processing', l:'Processing'}, {v:'shipped', l:'Shipped'}, {v:'delivered', l:'Delivered'}, {v:'cancelled', l:'Cancelled'}].map(tab => (
              <button 
                key={tab.v} 
                onClick={() => setStatusFilter(tab.v)} 
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', 
                  border: '1px solid ' + (statusFilter === tab.v ? 'var(--accent-blue)' : 'var(--border)'), 
                  background: statusFilter === tab.v ? 'rgba(0,212,255,0.08)' : 'transparent', 
                  color: statusFilter === tab.v ? 'var(--accent-blue)' : 'var(--text-secondary)', 
                  cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.85rem' 
                }}
              >
                {tab.l}
              </button>
            ))}
          </div>
          
          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)', marginLeft: '0.5rem' }}>{selectedOrders.size} selected</span>
              <select 
                value={bulkStatus} 
                onChange={(e) => setBulkStatus(e.target.value)}
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem', fontSize: '0.85rem' }}
              >
                <option value="">Bulk Action...</option>
                <option value="processing">Mark Processing</option>
                <option value="delivered">Mark Delivered</option>
                <option value="cancelled">Mark Cancelled</option>
              </select>
              <button onClick={handleBulkStatusUpdate} disabled={!bulkStatus} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>Apply</button>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0.5rem', width: 40, textAlign: 'center' }}>
                   <input type="checkbox" checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length} onChange={toggleSelectAll} style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }} />
                </th>
                <th style={{ padding: '1rem 0.5rem', width: 40 }}></th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Order ID & Date</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Payment & Total</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status Configuration</th>
                <th style={{ padding: '1rem 0', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading Orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found.</td></tr>
              ) : filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem', background: expandedOrders.has(order._id) || selectedOrders.has(order._id) ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                     <input type="checkbox" checked={selectedOrders.has(order._id)} onChange={() => toggleSelectOrder(order._id)} style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                     <button onClick={() => toggleExpand(order._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                       {expandedOrders.has(order._id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                     </button>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ fontWeight: 500 }}>{order.user?.name || 'Guest Checkout'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user?.email || 'N/A'}</div>
                    {order.shippingAddress && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                        <MapPin size={10} /> {order.shippingAddress.city}, {order.shippingAddress.state}
                      </div>
                    )}
                  </td>
                  
                  <td style={{ padding: '1rem 0' }}>
                     <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                     {order.paymentInfo?.method === 'razorpay' ? (
                       <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#3395FF', border: '1px solid currentColor', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>RAZORPAY</span>
                     ) : (
                       <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', border: '1px solid currentColor', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>COD</span>
                     )}
                  </td>
                  
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(order.status) }}></div>
                       <select 
                         value={order.status}
                         onChange={(e) => handleStatusChange(order, e.target.value)}
                         disabled={updateStatusMutation.isPending}
                         style={{
                           background: 'var(--bg-elevated)',
                           color: 'var(--text-primary)',
                           border: '1px solid var(--border)',
                           borderRadius: 'var(--radius-sm)',
                           padding: '0.4rem 0.5rem',
                           fontSize: '0.85rem',
                           outline: 'none',
                           cursor: 'pointer',
                           textTransform: 'capitalize'
                         }}
                       >
                         {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                           <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                         ))}
                       </select>
                    </div>
                  </td>
                  
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => setViewDetailOrder(order)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-blue)', background: 'rgba(0,212,255,0.07)', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 500 }}
                          title="Invoice"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                  </td>
                </tr>
                {/* Timeline row — Collapsible details area */}
                <AnimatePresence>
                  {expandedOrders.has(order._id) && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0, borderBottom: '2px solid var(--border)' }}>
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                          <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <OrderTimeline status={order.status} />

                            {order.deliveryInfo?.provider && (
                              <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Truck size={22} />
                                </div>
                                <div style={{ flex: 1, minWidth: 150 }}>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shipping Provider</p>
                                  <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{order.deliveryInfo.provider}</p>
                                </div>
                                {order.trackingNumber && (
                                  <div style={{ flex: 1, minWidth: 150 }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tracking Number (AWB)</p>
                                    <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{order.trackingNumber}</p>
                                  </div>
                                )}
                                {order.deliveryInfo.trackingUrl && (
                                  <a href={order.deliveryInfo.trackingUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                    <ExternalLink size={15} style={{ marginRight: '0.4rem' }}/> Track Package
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Return / Replacement Request Management */}
                            {order.returnRequest?.reason && (() => {
                              const rr = order.returnRequest;
                              const statusColors = {
                                pending: 'var(--accent-amber)',
                                under_review: 'var(--accent-blue)',
                                approved: 'var(--accent-green)',
                                rejected: 'var(--accent-red)',
                                completed: 'var(--text-muted)',
                              };
                              const clr = statusColors[rr.status] || statusColors.pending;
                              return (
                                <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: `1px solid ${clr}30` }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                      <RotateCcw size={18} color={clr} />
                                      <h4 style={{ fontWeight: 700, color: clr, fontSize: '1rem', margin: 0 }}>
                                        {rr.type === 'replacement' ? 'Replacement' : 'Return'} Request
                                      </h4>
                                    </div>
                                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, color: clr, border: `1px solid ${clr}40`, textTransform: 'uppercase' }}>
                                      {rr.status?.replace('_', ' ')}
                                    </span>
                                  </div>

                                  {/* Request details grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem 1.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    <div>
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</span>
                                      <p style={{ fontWeight: 500, marginTop: '0.15rem' }}>{rr.reason}</p>
                                    </div>
                                    {rr.preferredResolution && (
                                      <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Resolution</span>
                                        <p style={{ fontWeight: 500, marginTop: '0.15rem' }}>{rr.preferredResolution}</p>
                                      </div>
                                    )}
                                    {rr.itemsAffected?.length > 0 && (
                                      <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Affected</span>
                                        <p style={{ fontWeight: 500, marginTop: '0.15rem' }}>{rr.itemsAffected.join(', ')}</p>
                                      </div>
                                    )}
                                    {rr.contactPhone && (
                                      <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Phone</span>
                                        <p style={{ fontWeight: 500, marginTop: '0.15rem' }}>{rr.contactPhone}</p>
                                      </div>
                                    )}
                                    {rr.requestedAt && (
                                      <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</span>
                                        <p style={{ fontWeight: 500, marginTop: '0.15rem' }}>{new Date(rr.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {rr.description && (
                                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${clr}`, marginBottom: '1rem' }}>
                                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Customer Description</p>
                                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rr.description}</p>
                                    </div>
                                  )}

                                  {/* Admin controls */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>Update Status</label>
                                      <select
                                        className="input"
                                        value={rr.status}
                                        onChange={e => returnUpdateMutation.mutate({ orderId: order._id, status: e.target.value })}
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                                        <option value="pending">Pending</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="completed">Completed</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' }}>Admin Note</label>
                                      <input
                                        type="text"
                                        className="input"
                                        placeholder="Add note for customer..."
                                        value={returnNote[order._id] ?? (rr.adminNote || '')}
                                        onChange={e => setReturnNote(prev => ({ ...prev, [order._id]: e.target.value }))}
                                        style={{ fontSize: '0.85rem' }}
                                      />
                                    </div>
                                    <button
                                      onClick={() => returnUpdateMutation.mutate({ orderId: order._id, adminNote: returnNote[order._id] ?? rr.adminNote })}
                                      disabled={returnUpdateMutation.isPending}
                                      className="btn btn-primary"
                                      style={{ height: 42, gap: '0.4rem' }}
                                    >
                                      <Save size={15} />
                                      Save
                                    </button>
                                  </div>

                                  {rr.adminNote && !returnNote[order._id] && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Current Note</p>
                                      <p style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{rr.adminNote}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewDetailOrder && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OrderDetailModal order={viewDetailOrder} onClose={() => setViewDetailOrder(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal — admin with download + print */}
      <AnimatePresence>
        {invoiceOrder && (
          <motion.div key="invoice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} isAdmin={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {dispatchOrder && (
          <motion.div key="dispatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DispatchModal 
              order={dispatchOrder} 
              onClose={() => setDispatchOrder(null)} 
              onSubmit={(payload) => dispatchMutation.mutate({ id: dispatchOrder._id, payload })}
              isPending={dispatchMutation.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
