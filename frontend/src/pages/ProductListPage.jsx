import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import api from '../lib/axios';
import ProductCard from '../features/products/components/ProductCard';
import FallbackState from '../components/ui/FallbackState';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

const BRANDS = ['Arduino', 'Raspberry Pi', 'Espressif', 'STMicroelectronics', 'Adafruit', 'SparkFun'];

/* ── Sidebar Filters Component ─────────────────────────── */
const SidebarFilters = ({ categoriesData, category, brand, minPrice, maxPrice, featured, setParam, onClear, isMobile, onClose }) => {
  const Wrapper = isMobile ? 'div' : 'aside';

  return (
    <Wrapper style={{
      ...(isMobile ? {} : {
        width: 260,
        flexShrink: 0,
        position: 'sticky',
        top: '6rem',
        maxHeight: 'calc(100vh - 7rem)',
        overflowY: 'auto',
      }),
    }}>
      {/* Mobile header */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}><Filter size={18} style={{ display: 'inline', marginRight: 8 }} />Filters</h3>
          <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>
      )}

      {/* Category */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</p>
        <button
          onClick={() => { setParam('category', ''); if (isMobile) onClose?.(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', borderRadius: 8,
            border: 'none', cursor: 'pointer', fontSize: '0.88rem', marginBottom: 3,
            background: !category ? 'rgba(59,130,246,0.1)' : 'transparent',
            color: !category ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: !category ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          <Layers size={14} /> All Categories
        </button>
        {(categoriesData || []).map((cat) => (
          <button key={cat.slug} onClick={() => { setParam('category', cat.slug); if (isMobile) onClose?.(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.88rem', marginBottom: 3,
              background: category === cat.slug ? 'rgba(59,130,246,0.1)' : 'transparent',
              color: category === cat.slug ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontWeight: category === cat.slug ? 600 : 400,
              transition: 'all 0.15s',
            }}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Brand */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Brand</p>
        {BRANDS.map((b) => (
          <button key={b} onClick={() => { setParam('brand', brand === b ? '' : b); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.88rem', marginBottom: 3,
              background: brand === b ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: brand === b ? 'var(--accent-blue)' : 'var(--text-secondary)',
              fontWeight: brand === b ? 600 : 400,
              transition: 'all 0.15s',
            }}>
            {b}
          </button>
        ))}
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Range (₹)</p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input className="input" placeholder="Min" type="number" value={minPrice} onChange={(e) => setParam('minPrice', e.target.value)} style={{ fontSize: '0.88rem' }} />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input className="input" placeholder="Max" type="number" value={maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)} style={{ fontSize: '0.88rem' }} />
        </div>
      </div>

      {/* Featured Toggle */}
      <div style={{ marginBottom: '1.75rem' }}>
        <button
          onClick={() => setParam('featured', featured ? '' : 'true')}
          style={{
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
            border: `1.5px solid ${featured ? 'var(--accent-amber)' : 'var(--border)'}`,
            background: featured ? 'rgba(255,184,0,0.08)' : 'transparent',
            color: featured ? 'var(--accent-amber)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'all 0.15s',
          }}
        >
          ⭐ Featured Only
        </button>
      </div>

      {/* Clear */}
      <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => { onClear(); if (isMobile) onClose?.(); }}>
        Clear All Filters
      </button>
    </Wrapper>
  );
};

/* ── Main Page ─────────────────────────────────────────── */
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

  const clearAll = () => { setSearchParams({}); };

  const activeFilterCount = [category, brand, search, minPrice, maxPrice, featured].filter(Boolean).length;

  return (
    <div style={{ paddingTop: '5rem' }}>
      <Helmet>
        <title>All Products & Components | SparkTech</title>
        <meta name="description" content="Browse our entire catalog of microcontrollers, sensors, actuators, and power modules. Filter by category, brand, and price." />
      </Helmet>
      
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
              {/* Mobile-only filter button */}
              <button className="btn btn-outline mobile-filter-btn" onClick={() => setFiltersOpen(true)} style={{ display: 'none', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                <SlidersHorizontal size={16} /> Filters
                {activeFilterCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeFilterCount}
                  </span>
                )}
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

      {/* Main Content: Sidebar + Products */}
      <div className="container" style={{ paddingBlock: '2rem' }}>
        <div className="shop-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Desktop Sidebar */}
          <div className="desktop-sidebar" style={{ display: 'block' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <SidebarFilters
                categoriesData={categoriesData}
                category={category} brand={brand} minPrice={minPrice} maxPrice={maxPrice} featured={featured}
                setParam={setParam} onClear={clearAll} isMobile={false}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
              </div>
            ) : data?.products?.length === 0 ? (
              <div style={{ padding: '3rem 0' }}>
                <FallbackState
                  type="search"
                  title="No products found"
                  message="Try adjusting your filters or search terms to find what you're looking for."
                  onRetry={() => setSearchParams({})}
                />
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
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, backdropFilter: 'blur(4px)' }}
            />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(320px, 90vw)', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', zIndex: 1600, overflow: 'auto', padding: '1.5rem' }}
            >
              <SidebarFilters
                categoriesData={categoriesData}
                category={category} brand={brand} minPrice={minPrice} maxPrice={maxPrice} featured={featured}
                setParam={setParam} onClear={clearAll} isMobile={true} onClose={() => setFiltersOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-sidebar { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductListPage;
