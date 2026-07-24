import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ onSearchOpen }: { onSearchOpen: () => void }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const accountPath = isAuthenticated
    ? (user?.role === 'admin' ? '/admin' : '/account')
    : '/login';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Search, label: 'Search', onClick: onSearchOpen },
    { icon: User, label: 'Account', path: accountPath },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-[100] rounded-2xl overflow-hidden">
      <nav className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 pb-3 pt-2 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {navItems.map((item, index) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;

          const content = (
            <div className="flex flex-col items-center gap-0.5">
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${isActive ? 'text-priority-blue' : 'text-gray-400 dark:text-gray-500'}`}
                />
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
              <button key={index} onClick={item.onClick} className="relative flex-1 py-1.5 min-h-[48px] flex items-center justify-center outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={index} to={item.path!} className="relative flex-1 py-1.5 min-h-[48px] flex items-center justify-center">
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
