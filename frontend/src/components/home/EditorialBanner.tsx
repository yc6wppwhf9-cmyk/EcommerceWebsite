import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IMG, BANNER_CTA } from '../../constants/home';

interface EditorialBannerProps {
  hasProducts: boolean | null;
}

const EDITORIAL_SLIDES = [
  {
    id: 'slide-1',
    images: IMG.banner,
    to: '/luggage',
  },
  {
    id: 'slide-2',
    images: IMG.refPoster,
    to: '/backpacks',
  },
];

/**
 * Editorial banner section with 2 auto-cycling images in original styling.
 */
export const EditorialBanner: React.FC<EditorialBannerProps> = ({ hasProducts }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = EDITORIAL_SLIDES.length;

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
  }, [total]);

  const handleSelect = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      startAutoPlay();
    },
    [startAutoPlay]
  );

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const activeSlide = EDITORIAL_SLIDES[currentSlide] || EDITORIAL_SLIDES[0];

  const banner = hasProducts !== false
    ? {
        heading: 'New Arrival',
        subheading: 'Ready For Your Journey',
      }
    : {
        heading: 'Launching Soon',
        subheading: 'Ready For Your Journey',
      };

  return (
    <section className="relative bg-[#CBD7E0]" aria-label={banner.heading}>
      {/* ─── Mobile ─────────────────────────────────────────────────────── */}
      <div className="md:hidden relative w-full overflow-hidden min-h-[420px] flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <picture className="block h-full w-full">
              <source media="(max-width: 767px)" srcSet={activeSlide.images.mobileSrc} />
              <img
                src={activeSlide.images.desktopSrc}
                alt={banner.heading}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
                sizes="100vw"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-6 pb-8">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.35em] text-white mb-2">
            {banner.heading}
          </h2>
          <p className="text-[16px] font-outfit font-medium uppercase tracking-[0.2em] text-white/90 select-none mb-6">
            {banner.subheading}
          </p>
          <div className="flex items-center justify-between">
            <Link
              to={BANNER_CTA.to}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#748694] shadow-sm"
            >
              {BANNER_CTA.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Desktop ────────────────────────────────────────────────────── */}
      <div className="hidden md:block relative py-4 lg:py-6">
        <div className="max-w-[1720px] mx-auto px-8 lg:px-12 relative z-10 flex flex-row items-center gap-10 lg:gap-16">
          {/* Left Poster Image (2-slide animated container extending -mt-8 -mb-8) */}
          <div className="w-[42%] lg:w-[40%] relative z-30 rounded-sm overflow-hidden -mt-8 -mb-8 block group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <Link to={activeSlide.to} className="block w-full h-full">
                  <picture className="block h-full w-full">
                    <source media="(max-width: 767px)" srcSet={activeSlide.images.mobileSrc} />
                    <img
                      src={activeSlide.images.desktopSrc}
                      alt={banner.heading}
                      className="block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 40vw, 100vw"
                    />
                  </picture>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Text & Controls */}
          <div className="flex-1 text-left py-2">
            <h2 className="text-3xl lg:text-5xl font-bold uppercase tracking-[0.14em] text-[#748694] mb-3">
              {banner.heading}
            </h2>
            <p className="text-[14px] lg:text-[15px] font-outfit font-medium uppercase tracking-[0.2em] text-[#748694]/80 select-none pointer-events-none mb-6">
              {banner.subheading}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link
                to={BANNER_CTA.to}
                className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#748694] transition-all duration-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                {BANNER_CTA.label}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
