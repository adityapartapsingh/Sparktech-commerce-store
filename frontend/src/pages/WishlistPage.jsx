import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Zap, Star, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import FallbackState from '../components/ui/FallbackState';

const WishlistPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
    enabled: !!user
  });

  const toggleMutation = useMutation({
    mutationFn: (productId) => api.post(`/wishlist/toggle/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleRemove = (productId) => {
    toggleMutation.mutate(productId);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (product) => {
    if (!product.variants?.length) return toast.error('No variants available');
    const variant = product.variants[0];
    if (variant.stock === 0) return toast.error('Out of stock');

    const previous = useCartStore.getState().items;
    addItem(product, variant, 1);
    toast.success(`${product.name} added to cart!`);

    try {
      await api.post('/cart/add', {
        productId: product._id,
        variantId: variant._id,
        quantity: 1,
      });
    } catch {
      useCartStore.getState().rollback(previous);
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <Helmet>
        <title>{`Wishlist (${wishlist.length}) | SparkTech`}</title>
        <meta name="description" content="Your saved products on SparkTech." />
      </Helmet>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)' }}>Wishlist</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Heart size={24} color="var(--accent-red)" />
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem' }}>My Wishlist</h1>
        <span className="badge badge-blue" style={{ marginLeft: '0.5rem' }}>
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <FallbackState
          type="wishlist"
          title="Your wishlist is empty"
          message="Save items you love and come back to them later."
          action={{ label: 'Browse Shop', to: '/shop' }}
        />
      ) : (
        <div className="product-grid">
          <AnimatePresence>
            {wishlist.map((product) => {
              const defaultVariant = product.variants?.[0];
              const price = defaultVariant?.price || product.basePrice;
              const inStock = defaultVariant?.stock > 0;

              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card"
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <Link to={`/shop/${product.slug}`}>
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={40} color="var(--border)" />
                          </div>
                      }
                    </Link>
                    {/* Remove button */}
                    <button
                      className="wishlist-btn active"
                      onClick={() => handleRemove(product._id)}
                      style={{ position: 'absolute', top: 10, right: 10 }}
                      title="Remove from wishlist"
                    >
                      <Heart size={16} fill="var(--accent-red)" />
                    </button>
                    {product.isFeatured && (
                      <span className="badge badge-amber" style={{ position: 'absolute', top: 10, left: 10 }}>Featured</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {product.brand}
                    </p>
                    <Link to={`/shop/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </h3>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12}
                          fill={i < Math.round(product.ratings?.average || 0) ? "var(--accent-amber)" : "transparent"}
                          color={i < Math.round(product.ratings?.average || 0) ? "var(--accent-amber)" : "var(--border)"}
                        />
                      ))}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                        ({product.ratings?.count || 0})
                      </span>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                        ₹{price?.toLocaleString('en-IN')}
                      </span>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                        style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}
                      >
                        <ShoppingCart size={14} />
                        {inStock ? 'Add' : 'Out'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
