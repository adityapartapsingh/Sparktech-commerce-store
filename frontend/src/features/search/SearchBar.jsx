import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../lib/axios';

const SearchBar = ({ onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  const timerRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/products', { params: { search: q.trim(), limit: 6 } });
      setResults(res.data.data?.products || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (product) => {
    setIsOpen(false);
    setQuery('');
    if (onClose) onClose();
    navigate(`/products/${product.slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setIsOpen(false);
      if (onClose) onClose();
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup timer
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="search-wrapper" ref={wrapperRef} style={{ width: '100%', maxWidth: 500 }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search products, brands, components..."
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {isLoading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No products found for "{query}"
              </div>
            ) : (
              <>
                {results.map((product) => (
                  <div key={product._id} className="search-item" onClick={() => handleSelect(product)}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)',
                    }}>
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} color="var(--border)" />
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                          ₹{(product.basePrice || product.variants?.[0]?.price || 0).toLocaleString('en-IN')}
                        </span>
                        {product.ratings?.average > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--text-muted)' }}>
                            <Star size={10} fill="var(--accent-amber)" color="var(--accent-amber)" />
                            {product.ratings.average.toFixed(1)}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-muted)' }}>{product.brand}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  className="search-item"
                  onClick={handleSubmit}
                  style={{ justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  View all results for "{query}" →
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
