import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const IMAGES = {
  error:      '/images/error-robot.png',
  empty:      '/images/empty-cart.png',
  search:     '/images/no-results.png',
  server:     '/images/server-down.png',
  wishlist:   '/images/empty-wishlist.png',
};

/**
 * Reusable empty/error state component with illustrations
 *
 * Usage:
 *   <FallbackState type="error" title="Something went wrong" message="..." />
 *   <FallbackState type="empty" title="Your cart is empty" action={{ label: 'Shop Now', to: '/products' }} />
 */
const FallbackState = ({
  type = 'error',
  title = 'Oops! Something went wrong',
  message = "We're having trouble loading this page. Please try again.",
  action = null,
  onRetry = null,
  children,
}) => {
  const imgSrc = IMAGES[type] || IMAGES.error;

  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <img src={imgSrc} alt={title} loading="lazy" />
      <h3>{title}</h3>
      <p>{message}</p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary btn-sm">
            Try Again
          </button>
        )}
        {action && (
          <Link to={action.to} className="btn btn-outline btn-sm">
            {action.label}
          </Link>
        )}
      </div>

      {children}
    </motion.div>
  );
};

export default FallbackState;
