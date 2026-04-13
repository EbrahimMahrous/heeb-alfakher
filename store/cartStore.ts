// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  discountedPrice?: number;
  discountPercent?: number;
  quantity: number;
  image: string;
  weight?: string;
  origin?: string;
  originEn?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  error: string | null;
  // Actions
  fetchCart: (userId?: string) => Promise<void>;
  addItem: (item: CartItem, userId?: string) => Promise<void>;
  updateQuantity: (
    id: number,
    quantity: number,
    userId?: string,
  ) => Promise<void>;
  removeItem: (id: number, userId?: string) => Promise<void>;
  clearCart: (userId?: string) => Promise<void>;
  // Helper to recalc totals
  recalcTotals: () => void;
}

// Helper to calculate totals from items
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity,
    0,
  );
  return { totalItems, totalPrice };
};

// Local storage key for cart persistence
const CART_STORAGE_KEY = "heeb_cart";

// Helper to save cart to localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
};

// Helper to load cart from localStorage
const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }
  return [];
};

// Optional: sync with backend API (if available)
const syncCartToAPI = async (userId: string, items: CartItem[]) => {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, items }),
    });
    if (!response.ok) throw new Error("API sync failed");
    return await response.json();
  } catch (err) {
    console.warn("API sync failed, using localStorage only", err);
    return null;
  }
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  error: null,

  // Recalculate totals and save to localStorage
  recalcTotals: () => {
    const { items } = get();
    const { totalItems, totalPrice } = calculateTotals(items);
    set({ totalItems, totalPrice });
    saveCartToLocalStorage(items);
  },

  // Load cart from localStorage (no API call by default)
  fetchCart: async (userId = "guest") => {
    try {
      // Try to load from localStorage first
      const localItems = loadCartFromLocalStorage();
      if (localItems.length > 0) {
        const { totalItems, totalPrice } = calculateTotals(localItems);
        set({ items: localItems, totalItems, totalPrice, error: null });
      } else {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      }

      // Optional: try to sync with backend API (if available)
      // Uncomment below if you have a working API
      /*
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length) {
          set({ items: data.items, totalItems: data.totalItems, totalPrice: data.totalPrice });
          saveCartToLocalStorage(data.items);
        }
      }
      */
    } catch (err: any) {
      console.error("Error fetching cart", err);
      set({ error: err.message });
    }
  },

  addItem: async (item, userId = "guest") => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((i) => i.id === item.id);
    let newItems;
    if (existingIndex !== -1) {
      newItems = currentItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
      );
    } else {
      newItems = [...currentItems, item];
    }
    const { totalItems, totalPrice } = calculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
    saveCartToLocalStorage(newItems);

    // Optional: sync with API (non-blocking)
    syncCartToAPI(userId, newItems).catch(console.warn);
  },

  updateQuantity: async (id, quantity, userId = "guest") => {
    if (quantity < 1) return;
    const newItems = get().items.map((i) =>
      i.id === id ? { ...i, quantity } : i,
    );
    const { totalItems, totalPrice } = calculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
    saveCartToLocalStorage(newItems);

    // Optional: sync with API
    syncCartToAPI(userId, newItems).catch(console.warn);
  },

  removeItem: async (id, userId = "guest") => {
    const newItems = get().items.filter((i) => i.id !== id);
    const { totalItems, totalPrice } = calculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
    saveCartToLocalStorage(newItems);

    // Optional: sync with API
    syncCartToAPI(userId, newItems).catch(console.warn);
  },

  clearCart: async (userId = "guest") => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
    saveCartToLocalStorage([]);

    // Optional: sync with API
    syncCartToAPI(userId, []).catch(console.warn);
  },
}));
