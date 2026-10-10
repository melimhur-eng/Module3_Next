"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// The order is read on several screens, so it lives in a store.
// persist saves it to localStorage so it survives a refresh.
export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (dish) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === dish.id);
          if (existing) {
            return {
              items: s.items.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i)),
            };
          }
          return { items: [...s.items, { ...dish, qty: 1 }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    // The server has no localStorage, so the saved cart is loaded after the
    // first render (see CartHydration) to keep server and client HTML identical.
    { name: "addis-eats-cart", skipHydration: true }
  )
);

export const selectItems = (s) => s.items;
export const selectCount = (s) => s.items.reduce((sum, i) => sum + i.qty, 0);
export const selectTotal = (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
