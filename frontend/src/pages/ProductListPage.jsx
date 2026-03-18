import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import ProductCard from '../features/products/components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);
  const featured = searchParams.get('featured') || '';

  const params = { category, brand, search, minPrice, maxPrice, sort, page, featured, limit: 12 };
  const queryKey = ['products', params];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get('/products', { params }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
    staleTime: Infinity,
  });

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const BRANDS = ['Arduino', 'Raspberry Pi', 'Espressif', 'STMicroelectronics', 'Adafruit', 'SparkFun'];

  return (
    <div style={{ paddingTop: '5rem' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem' }}>
                {search ? `Search: "${search}"` : category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
              </h1>
              {data && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{data.pagination?.total} products</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="btn btn-outline" onClick={() => setFiltersOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Active Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {[
              { key: 'category', val: category },
              { key: 'brand', val: brand },
              { key: 'search', val: search },
              { key: 'minPrice', val: minPrice && `₹${minPrice}+` },
              { key: 'maxPrice', val: maxPrice && `under ₹${maxPrice}` },
              { key: 'featured', val: featured && 'Featured' },
            ].filter((f) => f.val).map(({ key, val }) => (
              <span key={key} className="badge badge-blue" style={{ cursor: 'pointer', gap: '0.4rem' }} onClick={() => setParam(key, '')}>
                {val} <X size={12} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: '2rem' }}>
        {/* Grid */}
        {isLoading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
          </div>
        ) : data?.products?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
            <h3 style={{ marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your filters</p>
            <button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear All Filters</button>
          </div>
        ) : (
          <motion.div layout className="product-grid">
            <AnimatePresence>
              {data?.products?.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === data.pagination.totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--text-muted)' }}>…</span>}
                  <button className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setParam('page', p)} style={{ minWidth: 40 }}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button className="btn btn-outline" disabled={page >= data.pagination.totalPages} onClick={() => setParam('page', page + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, backdropFilter: 'blur(4px)' }}
            />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(320px, 90vw)', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', zIndex: 1600, overflow: 'auto', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}><Filter size={18} style={{ display: 'inline', marginRight: 8 }} />Filters</h3>
                <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => setFiltersOpen(false)}><X size={20} /></button>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</p>
                {(categoriesData || []).map((cat) => (
                  <button key={cat.slug} onClick={() => { setParam('category', cat.slug); setFiltersOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginBottom: 4, background: category === cat.slug ? 'rgba(0,212,255,0.1)' : 'transparent', color: category === cat.slug ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Brand */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand</p>
                {BRANDS.map((b) => (
                  <button key={b} onClick={() => { setParam('brand', brand === b ? '' : b); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginBottom: 4, background: brand === b ? 'rgba(0,212,255,0.1)' : 'transparent', color: brand === b ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                    {b}
                  </button>
                ))}
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range (₹)</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input className="input" placeholder="Min" type="number" value={minPrice} onChange={(e) => setParam('minPrice', e.target.value)} style={{ fontSize: '0.9rem' }} />
                  <span style={{ color: 'var(--text-muted)' }}>–</span>
                  <input className="input" placeholder="Max" type="number" value={maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)} style={{ fontSize: '0.9rem' }} />
                </div>
              </div>

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { setSearchParams({}); setFiltersOpen(false); }}>
                Clear All Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListPage;
