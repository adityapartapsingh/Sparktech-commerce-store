import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, Truck, RotateCcw, ShoppingCart, Zap, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.variants?.length > 0 && !selectedVariant) {
        setSelectedVariant(data.variants[0]);
      }
    }
  });

  // Ensure selected variant is set when data loads if not set in onSuccess
  React.useEffect(() => {
    if (product && !selectedVariant && product.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--accent-blue)' }}
        />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Zap size={48} color="var(--accent-red)" style={{ opacity: 0.5 }} />
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">Back to Products</button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error('Please select a variant');
    if (selectedVariant.stock < qty) return toast.error('Not enough stock');

    const previous = useCartStore.getState().items;
    addItem(product, selectedVariant, qty);
    toast.success(`${product.name} added to cart!`);

    try {
      await api.post('/cart/add', {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: qty
      });
    } catch (err) {
      useCartStore.getState().rollback(previous);
      toast.error('Failed to add to cart on server');
    }
  };

  const images = product.images?.length > 0 ? product.images : [null];
  const stockInfo = selectedVariant
    ? selectedVariant.stock === 0 ? { label: 'Out of Stock', color: 'var(--accent-red)' }
      : selectedVariant.stock < 10 ? { label: `Only ${selectedVariant.stock} left`, color: 'var(--accent-amber)' }
      : { label: 'In Stock', color: 'var(--accent-green)' }
    : null;

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={14} />
        <span onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>Products</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </div>

      {/* Top Section: Gallery + Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        
        {/* Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ aspectRatio: '1/1', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={images[activeImage] || 'placeholder'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: images[activeImage] ? 'block' : 'none' }}
                alt={product.name}
              />
            </AnimatePresence>
            {!images[activeImage] && (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={64} color="var(--border)" />
              </div>
            )}
            {product.isFeatured && (
              <span className="badge badge-amber" style={{ position: 'absolute', top: 16, left: 16 }}>⚡ Featured</span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImage(idx)}
                style={{
                  width: 80, height: 80, flexShrink: 0, borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', overflow: 'hidden',
                  border: `2px solid ${activeImage === idx ? 'var(--accent-blue)' : 'transparent'}`,
                  background: 'var(--bg-elevated)', opacity: activeImage === idx ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              >
                {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Zap size={24} style={{ margin: 28, opacity: 0.2 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Details & Actions */}
        <div>
          <p style={{ color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {product.brand}
          </p>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16}
                  fill={i < Math.round(product.ratings?.average || 0) ? "var(--accent-amber)" : "transparent"}
                  color={i < Math.round(product.ratings?.average || 0) ? "var(--accent-amber)" : "var(--border)"}
                />
              ))}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SKU: {product.sku}</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{selectedVariant?.price.toLocaleString('en-IN') || product.basePrice.toLocaleString('en-IN')}
            </span>
            {stockInfo && (
              <span className={`badge badge-${stockInfo.color.includes('green') ? 'green' : stockInfo.color.includes('red') ? 'red' : 'amber'}`} style={{ marginLeft: '1rem', verticalAlign: 'middle' }}>
                {stockInfo.label}
              </span>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Select Variant</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => { setSelectedVariant(variant); setQty(1); }}
                    className={`btn ${selectedVariant?._id === variant._id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1rem' }}
                    disabled={variant.stock === 0}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ background: 'var(--bg-elevated)', border: 'none', padding: '0 1rem', color: 'var(--text-primary)', cursor: 'pointer', height: '100%' }}
              >-</button>
              <div style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{qty}</div>
              <button 
                onClick={() => setQty(Math.min(selectedVariant?.stock || 1, qty + 1))}
                disabled={qty >= (selectedVariant?.stock || 0)}
                style={{ background: 'var(--bg-elevated)', border: 'none', padding: '0 1rem', color: 'var(--text-primary)', cursor: 'pointer', height: '100%' }}
              >+</button>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
              onClick={handleAddToCart}
              disabled={selectedVariant?.stock === 0}
            >
              <ShoppingCart size={18} />
              {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>1 Year Warranty</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On all electronic parts</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Truck size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Fast Delivery</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2-4 business days</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <RotateCcw size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>7-Day Returns</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>If defective or damaged</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Data Sheet */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        {['description', 'specifications', 'documents'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 0', cursor: 'pointer', textTransform: 'capitalize',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-blue)' : 'transparent'}`,
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ minHeight: '30vh', paddingBottom: '4rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10 }}>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: '800px' }}>
                {product.description || 'No description available for this product.'}
              </p>
              
              {product.features?.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Key Features</h3>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {product.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'specifications' && (
            <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10 }}>
              {product.attributes?.length > 0 ? (
                <div style={{ maxWidth: '800px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {product.attributes.map((attr, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      padding: '1rem', 
                      background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-card)',
                      borderBottom: i !== product.attributes.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <div style={{ width: '40%', fontWeight: 600, color: 'var(--text-primary)' }}>{attr.name}</div>
                      <div style={{ width: '60%', color: 'var(--text-secondary)' }}>{attr.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No specifications available.</p>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10 }}>
              {product.datasheet ? (
                <a 
                  href={product.datasheet} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  Download Datasheet (PDF)
                </a>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No documents or datasheets available for this product.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ProductDetailPage;
