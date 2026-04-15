import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ onSearchOpen }: { onSearchOpen: () => void }) => {
  const location = useLocation();
  const { itemCount, toggleCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const accountPath = isAuthenticated
    ? (user?.role === 'admin' ? '/admin' : '/account')
    : '/login';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Search, label: 'Search', onClick: onSearchOpen },
    { icon: ShoppingCart, label: 'Cart', onClick: () => toggleCart() },
    { icon: User, label: 'Account', path: accountPath },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
      <nav className="bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/10 px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.map((item, index) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;

          const content = (
            <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${isActive ? 'text-priority-blue' : 'text-gray-400 dark:text-gray-500'}`}
                />
                {item.label === 'Cart' && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${isActive ? 'text-priority-blue' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-priority-blue rounded-full"
                />
              )}
            </div>
          );

          if (item.onClick) {
            return (
              <button key={index} onClick={item.onClick} className="relative py-1.5 px-2 outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={index} to={item.path!} className="relative py-1.5 px-2">
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
