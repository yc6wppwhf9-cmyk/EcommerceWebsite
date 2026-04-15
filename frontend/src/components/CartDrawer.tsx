import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../constants/products';

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, total, itemCount, removeItem, updateQuantity } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => toggleCart(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#111] z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-priority-blue" />
                <h2 className="text-lg font-outfit font-bold">
                  Your Cart <span className="text-gray-400 font-normal">({itemCount})</span>
                </h2>
              </div>
              <button
                onClick={() => toggleCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mb-6">Browse our collection and add items to get started.</p>
                  <Link
                    to="/backpacks"
                    onClick={() => toggleCart(false)}
                    className="bg-priority-blue text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-priority-dark transition-colors"
                  >
                    SHOP NOW
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 bg-gray-50 rounded-xl p-4">
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={() => toggleCart(false)}
                        className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={() => toggleCart(false)}
                          className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-priority-blue transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-priority-blue text-sm">{formatPrice(item.product.price)}</span>
                          <span className="text-gray-400 line-through text-xs">{formatPrice(item.product.originalPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-bold min-w-[36px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-xl font-outfit font-black text-gray-900">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={() => toggleCart(false)}
                  className="block w-full bg-priority-blue text-white font-bold text-sm py-4 rounded-xl text-center hover:bg-priority-dark transition-colors"
                >
                  PROCEED TO CHECKOUT
                </Link>
                <button
                  onClick={() => toggleCart(false)}
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
