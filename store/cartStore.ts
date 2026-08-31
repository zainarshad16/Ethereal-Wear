import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // cart item unique ID (e.g., productId + attributes)
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  size?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            const max = newItem.maxStock ?? existingItem.maxStock ?? Infinity;
            const newQuantity = Math.min(existingItem.quantity + newItem.quantity, max);
            return {
              items: state.items.map((item) =>
                item.id === newItem.id ? { ...item, quantity: newQuantity, maxStock: newItem.maxStock ?? item.maxStock } : item
              ),
              isOpen: true, // Auto open cart when adding items
            };
          }
          return { items: [...state.items, newItem], isOpen: true };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const max = item.maxStock ?? Infinity;
              return { ...item, quantity: Math.min(quantity, max) };
            }
            return item;
          }),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "ethereal-cart",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // If maxStock is missing on any item, we clear the cart
          // to prevent the infinite stock bug on old items.
          return { items: [] };
        }
        return persistedState;
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
