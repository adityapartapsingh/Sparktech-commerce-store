import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, ShieldCheck, Truck, RotateCcw, ShoppingCart, Zap, ChevronRight, MessageSquare, Trash2, User, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useWishlist } from '../hooks/useWishlist';
/* ── Reviews Section ──────────────────────────────────── */
const ReviewsSection = ({ productId, user, queryClient }) => {


  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/product/${productId}`).then(r => r.data.data),
    enabled: !!productId,
  });

  // Check if the logged-in user is eligible to review (must have purchased & received)
  const { data: eligibility } = useQuery({
    queryKey: ['review-eligibility', productId],
    queryFn: () => api.get(`/reviews/can-review/${productId}`).then(r => r.data.data),
    enabled: !!productId && !!user,
  });



  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{avgRating}</p>
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '0.35rem 0 0.2rem' }}>
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={14} fill={n <= Math.round(Number(avgRating)) ? 'var(--accent-amber)' : 'transparent'} color={n <= Math.round(Number(avgRating)) ? 'var(--accent-amber)' : 'var(--border)'} />
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ width: 16, textAlign: 'right', color: 'var(--text-muted)' }}>{star}</span>
                <Star size={12} fill="var(--accent-amber)" color="var(--accent-amber)" />
                <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-amber)', borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
                <span style={{ width: 28, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Prompts */}
      {user && eligibility?.canReview && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(255,184,0,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,184,0,0.2)', fontSize: '0.88rem', color: 'var(--accent-amber)' }}>
          <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          To write a review for this product, please visit your <a href="/orders" style={{ fontWeight: 700, color: 'inherit', textDecoration: 'underline' }}>Orders page</a>.
        </div>
      )}

      {user && eligibility?.hasReviewed && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.88rem', color: 'var(--accent-blue)' }}>
          You have already reviewed this product. Thank you for your feedback!
        </div>
      )}

      {user && eligibility && !eligibility.hasPurchased && !eligibility.hasReviewed && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Only verified buyers can write reviews. Purchase this product to share your experience.
        </div>
      )}

      {!user && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Please <a href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>log in</a> to write a review.
        </div>
      )}

      {/* Review list */}
      {reviewsLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>No reviews yet</p>
          <p style={{ fontSize: '0.85rem' }}>Be the first to share your experience with this product.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(review => (
            <div key={review._id} style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {review.user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{review.user?.name || 'Anonymous'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={14} fill={n <= review.rating ? 'var(--accent-amber)' : 'transparent'} color={n <= review.rating ? 'var(--accent-amber)' : 'var(--border)'} />
                    ))}
                  </div>
                  {review.user?._id === user?._id && (
                    <button
                      onClick={() => { if (window.confirm('Delete your review?')) deleteReview.mutate(review._id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                      title="Delete your review"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {review.title && <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{review.title}</p>}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>
              {review.verified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                  <ShieldCheck size={12} /> Verified Purchase
                </span>
              )}

              {/* Admin remarks — public response from SparkTech */}
              {review.adminRemarks && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-purple)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>SparkTech Response</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.adminRemarks}</p>
                  {review.remarkedAt && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(review.remarkedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { items: recentItems, addItem: addRecent } = useRecentlyViewed();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

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
  });

  // Ensure selected variant is set when data loads if not set in onSuccess
  React.useEffect(() => {
    if (product && !selectedVariant && product.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    if (product) addRecent(product);
  }, [product, selectedVariant, addRecent]);

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
        <button onClick={() => navigate('/shop')} className="btn btn-primary">Back to Shop</button>
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
      <Helmet>
        <title>{product.name} | SparkTech</title>
        <meta name="description" content={product.shortDescription || (product.description?.substring(0, 150) + '...')} />
        <meta property="og:title" content={`${product.name} - SparkTech`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
      </Helmet>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={14} />
        <span onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>Shop</span>
        
        {product.category && (
          <>
            <ChevronRight size={14} />
            <span 
              onClick={() => navigate(`/shop?category=${product.category.slug || product.category}`)} 
              style={{ cursor: 'pointer' }}
            >
              {product.category.name || 'Category'}
            </span>
          </>
        )}

        {product.subCategory && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-muted)' }}>{product.subCategory}</span>
          </>
        )}

        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
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
              <span className="badge badge-amber" style={{ position: 'absolute', top: 16, left: 16 }}>Featured</span>
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
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="btn btn-outline"
              style={{ width: '48px', padding: 0, justifyContent: 'center', borderColor: isInWishlist(product._id) ? 'var(--accent-red)' : 'var(--border)' }}
              onClick={() => toggleWishlist(product._id)}
              disabled={isToggling}
              title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart 
                size={20} 
                fill={isInWishlist(product._id) ? 'var(--accent-red)' : 'transparent'} 
                color={isInWishlist(product._id) ? 'var(--accent-red)' : 'var(--text-secondary)'} 
              />
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.shortWarranty || (product.warranty ? 'Warranty Available' : '1 Year Warranty')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.shortWarranty ? 'See Warranty tab for details' : 'On all electronic parts'}</p>
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
        {['description', 'specifications', 'reviews', 'warranty', 'documents'].map(tab => (
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
              {product.description ? (
                <div 
                  className="product-description"
                  style={{ lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: '800px' }}
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              ) : (
                <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: '800px' }}>
                  No description available for this product.
                </p>
              )}
              
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
                      <div style={{ width: '40%', fontWeight: 600, color: 'var(--text-primary)' }}>{attr.key}</div>
                      <div style={{ width: '60%', color: 'var(--text-secondary)' }}>{attr.value}{attr.unit ? ` ${attr.unit}` : ''}</div>
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

          {activeTab === 'warranty' && (
            <motion.div key="warranty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10 }}>
              {(product.shortWarranty || product.warranty) ? (
                <div style={{ maxWidth: '800px' }}>
                  {product.shortWarranty && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <ShieldCheck size={22} color="var(--accent-blue)" />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)' }}>{product.shortWarranty}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      {product.warranty}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No warranty information available for this product.</p>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10 }}>
              <ReviewsSection productId={product._id} user={user} queryClient={queryClient} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Contact Support Section — links to confidential portal */}
      <div style={{ marginTop: '1rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Have a complaint, suggestion, or feedback?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your messages are confidential and go directly to our team.</p>
          </div>
          <button
            onClick={() => navigate('/support')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <MessageSquare size={16} /> Contact Support
          </button>
        </div>
      </div>


      {/* Recently Viewed */}
      {recentItems.filter(r => r._id !== product._id).length > 0 && (
        <div style={{ paddingBottom: '4rem' }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recently Viewed</h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {recentItems.filter(r => r._id !== product._id).slice(0, 6).map(item => (
              <div
                key={item._id}
                onClick={() => navigate(`/shop/${item.slug}`)}
                style={{
                  minWidth: 180, maxWidth: 200, cursor: 'pointer',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ height: 140, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={32} color="var(--border)" />
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
                    ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
