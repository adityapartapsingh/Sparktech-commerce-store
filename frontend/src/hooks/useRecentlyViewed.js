import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sparktech_recently_viewed';
const MAX_ITEMS = 12;

/**
 * useRecentlyViewed — localStorage-backed recently viewed products.
 * Each item: { _id, name, slug, price, image }
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /** Add a product to the recently viewed list (deduplicated, LIFO) */
  const addItem = useCallback((product) => {
    if (!product?._id) return;
    setItems((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      const entry = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.variants?.[0]?.salePrice ?? product.variants?.[0]?.price ?? product.price ?? 0,
        image: product.images?.[0] || product.image || '',
      };
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  /** Clear the entire recently viewed list */
  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { items, addItem, clearAll };
};
