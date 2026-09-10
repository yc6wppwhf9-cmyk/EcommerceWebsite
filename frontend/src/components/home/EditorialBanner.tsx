import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BANNER_CTA } from '../../constants/home';
import type { GenderLink } from '../../constants/home';

interface EditorialBannerProps {
  hasProducts: boolean | null;
  genderStock: GenderLink[] | null;
}

const EDITORIAL_SLIDES = [
  {
    id: 'slide-1',
    image: '/New Arrival/Artboard 1@2x.png',
    to: '/luggage',
  },
  {
    id: 'slide-2',
    image: '/New Arrival/Artboard 3 copy 5@2x.png',
    to: '/backpacks',
  },
  {
    id: 'slide-3',
    image: '/New Arrival/Artboard 3 copy 6@2x.png',
    to: '/travel',
  },
  {
    id: 'slide-4',
    image: '/New Arrival/Artboard 3 copy 7@2x.png',
    to: '/college-backpacks',
  },
];

/**
 * Editorial banner section with New Arrival graphics and manual slider controls.
 */
export const EditorialBanner: React.FC<EditorialBannerProps> = ({ hasProducts, genderStock }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const total = EDITORIAL_SLIDES.length;

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleSelect = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const activeSlide = EDITORIAL_SLIDES[currentSlide] || EDITORIAL_SLIDES[0];

  const banner = hasProducts !== false
    ? {
        heading: 'New Arrival',
        subheading: 'Ready For Your Journey',
        links:
          genderStock && genderStock.length > 0
            ? genderStock.map(({ to, label }) => ({ to, label }))
            : [
                { to: '/women', label: 'Shop Women' },
                { to: '/men', label: 'Shop Men' },
              ],
      }
    : {
        heading: 'Launching Soon',
        subheading: 'Ready For Your Journey',
        links: [{ to: '/contact', label: 'Notify Me' }],
      };

  return (
    <section className="relative bg-ink" aria-label={banner.heading}>
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
            <img src={activeSlide.image} alt={banner.heading} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-6 pb-8">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.35em] text-white mb-2">
            {banner.heading}
          </h2>
          <p className="text-[16px] font-outfit font-medium uppercase tracking-[0.2em] text-white/80 select-none mb-6">
            {banner.subheading}
          </p>
          <div className="flex items-center justify-between">
            <Link
              to={BANNER_CTA.to}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink"
            >
              {BANNER_CTA.label}
              <ArrowRight size={14} />
            </Link>

            {/* Mobile Slide Dots */}
            <div className="flex gap-1.5 items-center">
              {EDITORIAL_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-5 bg-[#26B3FF]' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop ────────────────────────────────────────────────────── */}
      <div className="hidden md:block text-white relative py-4 lg:py-6">
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
                  <img
                    src={activeSlide.image}
                    alt={banner.heading}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 block"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Text & Controls */}
          <div className="flex-1 text-left py-2">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-brass mb-2">
              Fresh picks for every trip
            </p>
            <h2 className="text-3xl lg:text-5xl font-normal uppercase tracking-[0.14em] text-white mb-3">
              {banner.heading}
            </h2>
            <p className="text-[14px] lg:text-[15px] font-outfit font-normal uppercase tracking-[0.2em] text-white/50 select-none pointer-events-none mb-6">
              {banner.subheading}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link
                to={BANNER_CTA.to}
                className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-transform duration-500 hover:-translate-y-0.5"
              >
                {BANNER_CTA.label}
                <ArrowRight size={15} />
              </Link>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-ink transition-colors cursor-pointer text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-ink transition-colors cursor-pointer text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Slide Dots (2 slides) */}
            <div className="flex items-center gap-2 mt-6">
              {EDITORIAL_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? 'w-8 bg-[#26B3FF]' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
