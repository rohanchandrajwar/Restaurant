import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addToCart(item: MenuItem) {
    setItems((prev) => {
      const existing = prev.find((ci) => ci.menu_item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menu_item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menu_item: item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setItems((prev) => prev.filter((ci) => ci.menu_item.id !== itemId));
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((ci) => (ci.menu_item.id === itemId ? { ...ci, quantity } : ci))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalAmount = items.reduce((sum, ci) => sum + ci.menu_item.price * ci.quantity, 0);

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
