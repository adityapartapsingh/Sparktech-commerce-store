import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, UploadCloud, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../lib/axios';

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Variants (since react-hook-form handles standard inputs well, 
  // but dynamic arrays of objects are easier manually without complex field arrays here)
  const [variants, setVariants] = useState([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch Products
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      const res = await api.get('/products', { params: { search: searchTerm, limit: 50 } });
      return res.data;
    }
  });

  // Extract the array correctly whether it's wrapped in a pagination object or sent raw
  const rawData = pageData?.data;
  const products = Array.isArray(rawData) ? rawData : (rawData?.products || []);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      if (id) {
        return api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setIsModalOpen(false);
      reset();
      setVariants([]);
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product')
  });

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
       reset({
         name: product.name,
         brand: product.brand,
         category: product.category?._id || product.category,
         basePrice: product.basePrice,
         sku: product.sku,
         description: product.description,
         isActive: product.isActive
       });
       setVariants(product.variants || []);
    } else {
       reset({ name: '', brand: '', category: '', basePrice: '', sku: '', description: '', isActive: true });
       setVariants([{ sku: `SKU-${Math.floor(Math.random()*10000)}`, label: 'Default', price: 0, stock: 10 }]);
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (variants.length === 0) return toast.error('Add at least one variant');
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    formData.append('variants', JSON.stringify(variants));
    
    // Quick hack for image upload UI bypass (since we don't have file input in this basic modal yet)
    // Real implementation would append file objects to 'images' key
    
    saveMutation.mutate({ id: editingProduct?._id, formData });
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog, inventory, and variants.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="form-input" 
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
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Product</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>SKU</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Base Price</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Total Stock</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products found.</td></tr>
              ) : products.map(product => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <UploadCloud size={20} color="var(--text-muted)" style={{ margin: 14 }} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.brand}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{product.sku}</td>
                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>₹{product.basePrice?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`badge badge-${product.isActive ? 'green' : 'amber'}`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                       <button onClick={() => openModal(product)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                       <button onClick={() => { if(window.confirm('Delete this product?')) deleteMutation.mutate(product._id) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-red)' }}><Trash2 size={16} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Product Name *</label>
                    <input type="text" className="form-input" {...register('name', { required: true })} />
                  </div>
                  <div>
                    <label className="form-label">Brand *</label>
                    <input type="text" className="form-input" {...register('brand', { required: true })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Base Price (₹) *</label>
                    <input type="number" className="form-input" {...register('basePrice', { required: true })} />
                  </div>
                  <div>
                    <label className="form-label">Base SKU *</label>
                    <input type="text" className="form-input" {...register('sku', { required: true })} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} {...register('description')}></textarea>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Variants</h3>
                    <button type="button" onClick={() => setVariants([...variants, { sku: `${Date.now()}`, label: '', price: 0, stock: 0 }])} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>
                  
                  {variants.map((v, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input type="text" placeholder="Label (e.g. 5V Motor)" className="form-input" value={v.label} onChange={e => { const newV = [...variants]; newV[idx].label = e.target.value; setVariants(newV); }} />
                      <input type="text" placeholder="SKU" className="form-input" value={v.sku} onChange={e => { const newV = [...variants]; newV[idx].sku = e.target.value; setVariants(newV); }} />
                      <input type="number" placeholder="Price" className="form-input" value={v.price} onChange={e => { const newV = [...variants]; newV[idx].price = Number(e.target.value); setVariants(newV); }} />
                      <input type="number" placeholder="Stock" className="form-input" value={v.stock} onChange={e => { const newV = [...variants]; newV[idx].stock = Number(e.target.value); setVariants(newV); }} />
                      <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.5rem' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <input type="checkbox" id="isActive" {...register('isActive')} />
                  <label htmlFor="isActive">Product is active and visible to customers</label>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                  <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
                    {saveMutation.isPending ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProductsPage;
