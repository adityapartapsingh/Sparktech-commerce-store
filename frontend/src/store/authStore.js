import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // FIXME: storing the token in localStorage makes us vulnerable to XSS.
      // I should migrate this to httpOnly cookies for the JWT, but need to
      // figure out how to make that work nicely with the mobile app later.
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'SparkTech-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
