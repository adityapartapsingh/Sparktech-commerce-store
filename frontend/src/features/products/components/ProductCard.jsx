import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../../lib/axios';

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const defaultVariant = product.variants?.[0];

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!defaultVariant) return toast.error('No variant available');

    const previous = useCartStore.getState().items;
    addItem(product, defaultVariant, 1); // Optimistic
    toast.success(`${product.name} added to cart`);

    try {
      await api.post('/cart/add', {
        productId: product._id,
        variantId: defaultVariant._id,
        quantity: 1,
      });
      if (!isAuthenticated) {
        toast('Login to save your cart permanently!', {
          duration: 4000,
        });
      }
    } catch (err) {
      useCartStore.getState().rollback(previous);
      toast.error('Failed to add to cart');
    }
  };

  const stockStatus = defaultVariant
    ? defaultVariant.stock === 0
      ? { label: 'Out of Stock', color: 'var(--accent-red)' }
      : defaultVariant.stock < 10
      ? { label: `Only ${defaultVariant.stock} left`, color: 'var(--accent-amber)' }
      : { label: 'In Stock', color: 'var(--accent-green)' }
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="card" style={{ overflow: 'hidden', height: '100%' }}>
          {/* Image */}
          <div style={{
            aspectRatio: '4/3',
            background: 'var(--bg-secondary)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                loading="lazy"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
              }}>
                <Zap size={48} color="var(--accent-blue)" style={{ opacity: 0.3 }} />
              </div>
            )}
            {product.isFeatured && (
              <span className="badge badge-amber" style={{ position: 'absolute', top: 10, left: 10 }}>
                Featured
              </span>
            )}
            {defaultVariant?.stock === 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="badge badge-red" style={{ fontSize: '0.9rem' }}>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand}
            </p>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Inter,sans-serif', lineHeight: 1.4 }}>
              {product.name}
            </h3>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                <Star size={13} fill="var(--accent-amber)" color="var(--accent-amber)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {product.ratings.average} ({product.ratings.count})
                </span>
              </div>
            )}

            {/* Variants count */}
            {product.variants?.length > 1 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {product.variants.length} variants available
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <div>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)' }}>
                  ₹{defaultVariant?.price?.toLocaleString('en-IN') || product.basePrice?.toLocaleString('en-IN')}
                </span>
                {stockStatus && (
                  <p style={{ fontSize: '0.72rem', color: stockStatus.color, marginTop: '0.15rem' }}>
                    {stockStatus.label}
                  </p>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="btn btn-primary"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                onClick={handleAddToCart}
                disabled={defaultVariant?.stock === 0}
              >
                <ShoppingCart size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
