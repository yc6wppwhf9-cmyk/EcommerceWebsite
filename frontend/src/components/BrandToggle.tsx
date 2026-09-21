import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

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
      navigate('/');
    } else {
      navigate('/premium');
    }
  };

  const isSmall = size === 'sm';
  const pillLayoutId = `brand-pill-bg-${size}`;

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 md:p-1.5 backdrop-blur-md transition-all duration-300 select-none ${
        isPremium
          ? 'bg-white/10 border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.08)]'
          : isJunior
            ? 'bg-black/20 border border-white/25'
            : 'bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15'
      } ${className}`}
      role="group"
      aria-label="Brand Mode Switcher"
    >
      {/* Priority (Normal) Mode */}
      <button
        type="button"
        onClick={() => handleSwitch('priority')}
        className={`relative flex items-center gap-1.5 rounded-full font-outfit font-extrabold uppercase transition-colors duration-200 z-10 cursor-pointer ${
          isSmall ? 'px-3 py-1.5 text-[11px] tracking-[0.14em]' : 'px-4 py-2 text-[12px] md:text-[13px] tracking-[0.16em]'
        } ${
          !isPremium
            ? 'text-black'
            : 'text-white/80 hover:text-white'
        }`}
      >
        {!isPremium && (
          <motion.div
            layoutId={pillLayoutId}
            className="absolute inset-0 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-black/5 z-0"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <img
            src="/priority-icon.png"
            alt="Priority"
            className={`${isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'} object-contain flex-shrink-0`}
          />
          <span>PRIORITY</span>
        </span>
      </button>

      {/* Traworld (Premium Luxe) Mode */}
      <button
        type="button"
        onClick={() => handleSwitch('traworld')}
        className={`relative flex items-center gap-1.5 rounded-full font-outfit font-extrabold uppercase transition-colors duration-200 z-10 cursor-pointer ${
          isSmall ? 'px-3 py-1.5 text-[11px] tracking-[0.14em]' : 'px-4 py-2 text-[12px] md:text-[13px] tracking-[0.16em]'
        } ${
          isPremium
            ? 'text-black'
            : isJunior
              ? 'text-white/80 hover:text-white'
              : 'text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white'
        }`}
      >
        {isPremium && (
          <motion.div
            layoutId={pillLayoutId}
            className="absolute inset-0 bg-white rounded-full shadow-[0_2px_12px_rgba(255,255,255,0.35)] border border-white z-0"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <img
            src={isPremium ? '/traworld-icon-dark.png' : (isJunior ? '/traworld-icon.png' : '/traworld-icon-dark.png')}
            alt="Traworld"
            className={`${isSmall ? 'w-4.5 h-4' : 'w-5 h-4.5'} object-contain flex-shrink-0`}
          />
          <span>TRAWORLD</span>
        </span>
      </button>
    </div>
  );
};
