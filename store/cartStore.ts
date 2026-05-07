import { create } from "zustand";

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
  flagUrl?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  error: string | null;
  // Actions
  fetchCart: () => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  recalcTotals: () => void;
}

// Local storage key for cart persistence
const CART_STORAGE_KEY = "heeb_cart";

// Save cart to localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
};

// Load cart from localStorage
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

// Helper to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity,
    0,
  );
  return { totalItems, totalPrice };
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  error: null,

  // Recalculate totals and persist
  recalcTotals: () => {
    const { items } = get();
    const { totalItems, totalPrice } = calculateTotals(items);
    set({ totalItems, totalPrice });
    saveCartToLocalStorage(items);
  },

  // Load cart strictly from localStorage – no HTTP
  fetchCart: () => {
    try {
      const localItems = loadCartFromLocalStorage();
      const { totalItems, totalPrice } = calculateTotals(localItems);
      set({ items: localItems, totalItems, totalPrice, error: null });
    } catch (err: any) {
      console.error("Error reading cart from localStorage", err);
      set({ error: err.message, items: [], totalItems: 0, totalPrice: 0 });
    }
  },

  addItem: (item) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((i) => i.id === item.id);
    let newItems: CartItem[];
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
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) return;
    const newItems = get().items.map((i) =>
      i.id === id ? { ...i, quantity } : i,
    );
    const { totalItems, totalPrice } = calculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
    saveCartToLocalStorage(newItems);
  },

  removeItem: (id) => {
    const newItems = get().items.filter((i) => i.id !== id);
    const { totalItems, totalPrice } = calculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
    saveCartToLocalStorage(newItems);
  },

  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
    saveCartToLocalStorage([]);
  },
}));