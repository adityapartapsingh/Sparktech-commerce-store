import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Layers, ChevronRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const AdminCategoriesPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [description, setDescription] = useState('');

  // Fetch Categories
  const { data: catData, isLoading } = useQuery({
    queryKey: ['admin-categories-full'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
    enabled: !!user
  });
  const categories = catData?.data || [];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCategory) {
        return api.put(`/categories/${editingCategory._id}`, data);
      }
      return api.post('/categories', data);
    },
    onSuccess: () => {
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['admin-categories-full']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save category')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries(['admin-categories-full']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete category')
  });

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setName(category.name);
      setParent(category.parent?._id || category.parent || '');
      setDescription(category.description || '');
    } else {
      setName('');
      setParent('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return toast.error('Name is required');
    saveMutation.mutate({ name, parent: parent || null, description });
  };

  // Group categories into a tree structure
  const mainCategories = categories.filter(c => !c.parent);
  const getSubcategories = (parentId) => categories.filter(c => c.parent?._id === parentId || c.parent === parentId);

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Category Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organize your store hierarchy with categories and subcategories.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Category Tree/List */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--accent-blue)" /> Store Hierarchy
          </h2>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</div>
          ) : mainCategories.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              No categories found. Start by adding your first main category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mainCategories.map(cat => (
                <div key={cat._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronRight size={18} />
                       </div>
                       <div>
                         <p style={{ fontWeight: 600, fontSize: '1rem' }}>{cat.name}</p>
                         <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.slug}</p>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal(cat)} style={{ padding: '0.4rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => { if(window.confirm(`Delete "${cat.name}" and all its subcategories?`)) deleteMutation.mutate(cat._id) }} style={{ padding: '0.4rem', color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  <div style={{ padding: '0.5rem 1rem 1rem 3.5rem', background: 'rgba(0,0,0,0.1)' }}>
                    {getSubcategories(cat._id).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>No subcategories</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {getSubcategories(cat._id).map(sub => (
                          <div key={sub._id} style={{ padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{sub.name}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openModal(sub)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={14} /></button>
                              <button onClick={() => { if(window.confirm(`Delete subcategory "${sub.name}"?`)) deleteMutation.mutate(sub._id) }} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => { openModal(); setParent(cat._id); }} style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={14} /> Add Subcategory
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} color="var(--accent-amber)" /> Usage Tip
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Categories help users find products easily. 
            <br /><br />
            <strong>Main Categories</strong> (e.g., Electronics) appear in the top-level navigation.
            <br /><br />
            <strong>Subcategories</strong> (e.g., Microcontrollers) are nested inside main categories for granular filtering.
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 450, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="label">Category Name *</label>
                  <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Microcontrollers" required autoFocus />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="label">Parent Category</label>
                  <select className="input" value={parent} onChange={e => setParent(e.target.value)} style={{ appearance: 'none' }}>
                    <option value="">None (Make this a Main Category)</option>
                    {mainCategories.filter(c => c._id !== editingCategory?._id).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Description (Optional)</label>
                  <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short summary..." rows={3} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary" style={{ flex: 1 }}>
                    {saveMutation.isPending ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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

export default AdminCategoriesPage;
