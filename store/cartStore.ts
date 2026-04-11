import { create } from 'zustand';

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
  fetchCart: (userId?: string) => Promise<void>;
  addItem: (item: CartItem, userId?: string) => Promise<void>;
  updateQuantity: (id: number, quantity: number, userId?: string) => Promise<void>;
  removeItem: (id: number, userId?: string) => Promise<void>;
  clearCart: (userId?: string) => Promise<void>;
}

const getUserId = () => 'guest';

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  error: null,

  fetchCart: async (userId = getUserId()) => {
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      set({ items: data.items, totalItems: data.totalItems, totalPrice: data.totalPrice });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addItem: async (item, userId = getUserId()) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(i => i.id === item.id);
    let newItems;
    if (existingIndex !== -1) {
      newItems = currentItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newItems = [...currentItems, item];
    }
    const newTotalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
    const newTotalPrice = newItems.reduce((sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity, 0);
    set({ items: newItems, totalItems: newTotalItems, totalPrice: newTotalPrice });

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, item }),
      });
    } catch (err) {
      console.error('Error syncing cart, reverting...', err);
      await get().fetchCart(userId);
    }
  },

  updateQuantity: async (id, quantity, userId = getUserId()) => {
    const newItems = get().items.map(i => i.id === id ? { ...i, quantity } : i);
    const newTotalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
    const newTotalPrice = newItems.reduce((sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity, 0);
    set({ items: newItems, totalItems: newTotalItems, totalPrice: newTotalPrice });

    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, id, quantity }),
      });
    } catch (err) {
      console.error('Error updating quantity', err);
      await get().fetchCart(userId);
    }
  },

  removeItem: async (id, userId = getUserId()) => {
    const newItems = get().items.filter(i => i.id !== id);
    const newTotalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
    const newTotalPrice = newItems.reduce((sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity, 0);
    set({ items: newItems, totalItems: newTotalItems, totalPrice: newTotalPrice });

    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, id }),
      });
    } catch (err) {
      console.error('Error removing item', err);
      await get().fetchCart(userId);
    }
  },

  clearCart: async (userId = getUserId()) => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clearAll: true }),
      });
    } catch (err) {
      console.error('Error clearing cart', err);
      await get().fetchCart(userId);
    }
  },
}));