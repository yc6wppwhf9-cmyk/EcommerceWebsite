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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
      <nav className="bg-white/95 dark:bg-[#0f1417]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-white/10 py-1.5 px-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {navItems.map((item, index) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const Icon = item.icon;

          const content = (
            <div className="flex flex-col items-center gap-0.5 relative py-0.5">
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={`transition-all duration-200 ${isActive ? 'text-[#26B3FF]' : 'text-gray-400 dark:text-gray-500'}`}
              />
              <span className={`text-[8.5px] font-medium tracking-tight transition-colors duration-200 ${isActive ? 'text-[#26B3FF] font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#26B3FF] rounded-full"
                />
              )}
            </div>
          );

          if (item.onClick) {
            return (
              <button key={index} onClick={item.onClick} className="relative flex-1 py-1 flex items-center justify-center outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={index} to={item.path!} className="relative flex-1 py-1 flex items-center justify-center">
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
