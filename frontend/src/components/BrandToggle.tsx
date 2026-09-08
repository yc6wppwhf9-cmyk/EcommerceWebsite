import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface BrandToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const BrandToggle: React.FC<BrandToggleProps> = ({ className = '', size = 'md' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const isJunior = location.pathname.startsWith('/junior') || searchParams.get('theme') === 'junior';
  const isPremium = !isJunior && (location.pathname.startsWith('/premium') || searchParams.get('theme') === 'premium');

  const handleSwitch = (target: 'priority' | 'traworld') => {
    if (target === 'priority') {
      if (location.pathname === '/premium') {
        navigate('/');
      } else if (searchParams.get('theme') === 'premium') {
        searchParams.delete('theme');
        const qs = searchParams.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
      } else {
        navigate('/');
      }
    } else {
      if (location.pathname === '/' || location.pathname.startsWith('/junior')) {
        navigate('/premium');
      } else if (
        location.pathname.startsWith('/product/') ||
        location.pathname.startsWith('/wishlist') ||
        location.pathname.startsWith('/account') ||
        location.pathname.startsWith('/about') ||
        location.pathname.startsWith('/careers') ||
        location.pathname.startsWith('/contact')
      ) {
        navigate('/premium');
      } else {
        // category page like /backpacks, /luggage
        searchParams.set('theme', 'premium');
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/15 select-none ${className}`}
      role="group"
      aria-label="Brand Mode Switcher"
    >
      {/* Priority (Normal) Mode */}
      <button
        type="button"
        onClick={() => handleSwitch('priority')}
        className={`relative flex items-center gap-1.5 rounded-full font-outfit font-bold uppercase transition-colors duration-200 z-10 cursor-pointer ${
          isSmall ? 'px-2.5 py-1 text-[10px] tracking-[0.14em]' : 'px-3 py-1.5 text-[11px] tracking-[0.16em]'
        } ${
          !isPremium
            ? 'text-black'
            : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        {!isPremium && (
          <motion.div
            layoutId="brand-pill-bg"
            className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-black/5"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] font-black leading-none">
            P
          </span>
          <span>Priority</span>
        </span>
      </button>

      {/* Traworld (Premium Luxe) Mode */}
      <button
        type="button"
        onClick={() => handleSwitch('traworld')}
        className={`relative flex items-center gap-1.5 rounded-full font-outfit font-bold uppercase transition-colors duration-200 z-10 cursor-pointer ${
          isSmall ? 'px-2.5 py-1 text-[10px] tracking-[0.14em]' : 'px-3 py-1.5 text-[11px] tracking-[0.16em]'
        } ${
          isPremium
            ? 'text-white'
            : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        {isPremium && (
          <motion.div
            layoutId="brand-pill-bg"
            className="absolute inset-0 bg-[#0F1417] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-white/20"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Sparkles size={isSmall ? 10 : 12} className={isPremium ? 'text-amber-400' : 'text-current opacity-70'} />
          <span>Traworld</span>
        </span>
      </button>
    </div>
  );
};
