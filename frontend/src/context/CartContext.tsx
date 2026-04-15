import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Product, CartItem, Toast } from '../types';

// ─── State ───────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  toasts: Toast[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART'; isOpen?: boolean }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'HYDRATE'; items: CartItem[] };

const STORAGE_KEY = 'priority-bags-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      const qty = action.quantity || 1;
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, action.product.stock);
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: Math.min(qty, action.product.stock) }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: Math.min(action.quantity, i.product.stock) }
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: action.isOpen !== undefined ? action.isOpen : !state.isOpen };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'HYDRATE':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  toasts: Toast[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false, toasts: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) dispatch({ type: 'HYDRATE', items: parsed });
      }
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* ignore */ }
  }, [state.items]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3000);
  }, []);

  const addItem = useCallback(
    (product: Product, quantity?: number) => {
      if (product.stock <= 0) {
        showToast('This product is out of stock', 'error');
        return;
      }
      dispatch({ type: 'ADD_ITEM', product, quantity });
      showToast(`${product.name} added to cart`);
    },
    [showToast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      dispatch({ type: 'REMOVE_ITEM', productId });
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    showToast('Cart cleared', 'info');
  }, [showToast]);

  const toggleCart = useCallback((isOpen?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', isOpen });
  }, []);

  const total = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        toasts: state.toasts,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
