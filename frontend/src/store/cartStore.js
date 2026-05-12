import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],        // Optimistic local cache
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Optimistic add — updates UI instantly, server call handled by useAddToCart hook
      addItem: (product, variant, quantity = 1) => {
        const existing = get().items.find(
          (i) => i.productId === product._id && i.variantId === variant._id
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === product._id && i.variantId === variant._id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                productId: product._id,
                variantId: variant._id,
                name: product.name,
                variantLabel: variant.label,
                price: variant.price,
                image: product.images?.[0],
                quantity,
                stock: variant.stock,
              },
            ],
          }));
        }
      },

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Rollback for optimistic error
      rollback: (previous) => set({ items: previous }),

      // Fetch cart from server
      fetchCart: async () => {
        try {
          const response = await api.get('/cart');
          set({ items: response.data?.data || response.data || [] });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      },

      cartTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      cartCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'robomart-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
