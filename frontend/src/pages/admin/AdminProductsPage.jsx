import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, UploadCloud, Search, ImageIcon, Layers, Settings2, Download, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { exportData } from '../../lib/exportData';

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('general');

  // Inline Category Creation State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Media State
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Variant State
  const [variants, setVariants] = useState([]);
  
  const { register, handleSubmit, reset, watch } = useForm();

  const brandName = watch('brand');
  const catId = watch('category');

  // Fetch Categories
  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });
  const categories = catData?.data || [];

  // Fetch Products
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: async () => {
      const res = await api.get('/products', { params: { search: searchTerm, limit: 50 } });
      return res.data;
    }
  });

  const rawData = pageData?.data;
  const products = Array.isArray(rawData) ? rawData : (rawData?.products || []);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

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
      setImageFiles([]);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product')
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name) => api.post('/categories', { name }),
    onSuccess: (res) => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries(['admin-categories']);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      // Auto-select the newly minted category
      reset({ ...watch(), category: res.data.data._id });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create category')
  });

  const openModal = (product = null) => {
    setEditingProduct(product);
    setActiveTab('general');
    setImageFiles([]);
    
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
       setExistingImages(product.images || []);
    } else {
       reset({ name: '', brand: '', category: categories[0]?._id || '', basePrice: '', sku: `SKU-${Math.floor(Math.random()*10000)}`, description: '', isActive: true });
       setVariants([{ sku: '', label: 'Default', price: 0, stock: 10 }]);
       setExistingImages([]);
    }
    setIsModalOpen(true);
  };

  const generateSKUs = () => {
    if(!brandName) return toast.error('Please enter a Brand in the General tab first');
    if(!catId) return toast.error('Please select a Category in the General tab first');

    const catName = categories.find(c => c._id === catId)?.name || 'CAT';
    const catCode = catName.substring(0,3).toUpperCase();
    const brandCode = brandName.substring(0,3).toUpperCase();
    
    setVariants(variants.map((v, idx) => ({
      ...v,
      sku: `${catCode}-${brandCode}-${(idx + 1).toString().padStart(3, '0')}`
    })));
  };

  const onSubmit = (data) => {
    if (variants.length === 0) return toast.error('Add at least one variant');
    
    // Client-side unique SKU check
    const skus = variants.map(v => v.sku);
    if (new Set(skus).size !== skus.length) {
      setActiveTab('variants');
      return toast.error('Duplicate SKUs found! Each variant must have a unique SKU.');
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    formData.append('variants', JSON.stringify(variants));
    
    // Append Images
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    saveMutation.mutate({ id: editingProduct?._id, formData });
  };

  const handleImageSelect = (e) => {
    if(e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleExport = async (format) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const headers = ['Name', 'SKU', 'Brand', 'Base Price (INR)', 'Variants', 'Total Stock', 'Status'];
      const rows = products.map(p => [
        p.name,
        p.sku,
        p.brand || '',
        p.basePrice || 0,
        p.variants?.length || 0,
        p.variants?.reduce((s, v) => s + v.stock, 0) || 0,
        p.isActive ? 'Active' : 'Draft',
      ]);
      await exportData({ format, filename: 'SparkTech_products', title: 'SparkTech — Products Inventory', headers, rows });
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
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Advanced SKU and media management engine.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
          <button onClick={() => openModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
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

      {/* Advanced Tabbed CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.2rem' }}>{editingProduct ? 'Edit Product Configuration' : 'New Product Configuration'}</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fill in the details below to provision this SKU.</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                {[{ id: 'general', icon: <Settings2 size={16} />, label: 'General Info' }, { id: 'media', icon: <ImageIcon size={16} />, label: 'Media & Uploads' }, { id: 'variants', icon: <Layers size={16} />, label: 'Inventory & Variants' }].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                      color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content Scroll Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <form id="productForm" onSubmit={handleSubmit(onSubmit)}>
                  
                  {/* TAB 1: GENERAL */}
                  <div style={{ display: activeTab === 'general' ? 'block' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label className="label">Product Name *</label>
                        <input type="text" className="input" placeholder="e.g. Raspberry Pi 4 Model B" {...register('name', { required: true })} />
                      </div>
                      <div>
                        <label className="label">Brand *</label>
                        <input type="text" className="input" placeholder="e.g. Raspberry Pi" {...register('brand', { required: true })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <label className="label" style={{ margin: 0 }}>Category *</label>
                          <button type="button" onClick={() => setIsCreatingCategory(!isCreatingCategory)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                            {isCreatingCategory ? 'Cancel' : '+ New Category'}
                          </button>
                        </div>
                        
                        {isCreatingCategory ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" className="input" placeholder="New Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                            <button type="button" onClick={() => { if(newCategoryName) createCategoryMutation.mutate(newCategoryName) }} disabled={!newCategoryName || createCategoryMutation.isPending} className="btn btn-primary" style={{ padding: '0 1rem' }}>
                              {createCategoryMutation.isPending ? '...' : 'Save'}
                            </button>
                          </div>
                        ) : (
                          <select className="input" {...register('category', { required: true })} style={{ appearance: 'none' }}>
                             <option value="">Select Category</option>
                             {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="label">Base Price (auto from variants)</label>
                        <div style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: 'var(--radius-md)', 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border)',
                          color: variants.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}>
                          {variants.length > 0
                            ? `₹${Math.min(...variants.map(v => Number(v.price) || 0)).toLocaleString('en-IN')}`
                            : '— Set in Variants tab'}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          Auto-calculated from the lowest variant price.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="label">Base Global SKU *</label>
                      <input type="text" className="input" placeholder="RM-RPI-001" {...register('sku', { required: true })} />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="label">Full Description</label>
                      <textarea className="input" rows={4} placeholder="Hardware specifications, features, etc..." {...register('description')}></textarea>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <input type="checkbox" id="isActive" {...register('isActive')} style={{ width: 18, height: 18, accentColor: 'var(--accent-green)' }} />
                      <label htmlFor="isActive" style={{ fontWeight: 500, color: 'var(--accent-green)' }}>Product is globally active and visible on store</label>
                    </div>
                  </div>

                  {/* TAB 2: MEDIA */}
                  <div style={{ display: activeTab === 'media' ? 'block' : 'none' }}>
                    <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
                       <UploadCloud size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                       <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload Product Images</h3>
                       <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Select up to 10 high-resolution images. First image will be the primary display.</p>
                       
                       <input type="file" id="fileUpload" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                       <label htmlFor="fileUpload" className="btn btn-outline" style={{ display: 'inline-flex', cursor: 'pointer' }}>Browse Files</label>
                    </div>

                    {(existingImages.length > 0 || imageFiles.length > 0) && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selected Media Preview</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {existingImages.map((url, i) => (
                            <div key={`ex-${i}`} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderBottomRightRadius: 'var(--radius-md)' }}>Saved</div>
                            </div>
                          ))}
                          {imageFiles.map((f, i) => (
                            <div key={`new-${i}`} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--accent-blue)', position: 'relative' }}>
                              <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button type="button" onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TAB 3: VARIANTS */}
                  <div style={{ display: activeTab === 'variants' ? 'block' : 'none' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Variant Configurator</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Auto-generate consistent SKUs based on Brand and Category codes.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={generateSKUs} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Auto-Generate SKUs</button>
                        <button type="button" onClick={() => setVariants([...variants, { sku: '', label: '', price: 0, stock: 0 }])} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}><Plus size={14} /> Add Variant</button>
                      </div>
                    </div>
                    
                    {variants.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                         No variants added. Add at least one default variant.
                       </div>
                    ) : (
                      variants.map((v, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr) 100px 100px 40px', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <input type="text" placeholder="Title (e.g. 5V Motor)" className="input" value={v.label} onChange={e => { const newV = [...variants]; newV[idx].label = e.target.value; setVariants(newV); }} required />
                          <input type="text" placeholder="SKU" className="input" value={v.sku} onChange={e => { const newV = [...variants]; newV[idx].sku = e.target.value.toUpperCase(); setVariants(newV); }} required style={{ fontFamily: 'monospace', color: 'var(--accent-amber)' }} />
                          <input type="number" placeholder="+ Price" className="input" value={v.price} onChange={e => { const newV = [...variants]; newV[idx].price = Number(e.target.value); setVariants(newV); }} required />
                          <input type="number" placeholder="Stock" className="input" value={v.stock} onChange={e => { const newV = [...variants]; newV[idx].stock = Number(e.target.value); setVariants(newV); }} required />
                          <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                </form>
              </div>

              {/* Footer Actions */}
              <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   {activeTab === 'general' ? 'Next: Add Media' : activeTab === 'media' ? 'Next: Configure Variants' : 'Ready to save'}
                </span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Discard Changes</button>
                  <button type="submit" form="productForm" disabled={saveMutation.isPending} className="btn btn-primary">
                    {saveMutation.isPending ? 'Provisioning...' : editingProduct ? 'Save Validated Changes' : 'Provision Product SKU'}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProductsPage;
