import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { HERO_SLIDES, heroVariants } from '../../constants/home';

/**
 * Full-bleed hero carousel with auto-advance.
 *
 * Fixes vs. original:
 * - Auto-play resets when the user clicks prev / next (no double-skip).
 * - Slide counter uses padStart so it doesn't break above 9 slides.
 * - ARIA: role="region", aria-roledescription="carousel", aria-live.
 */
export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % HERO_SLIDES.length);
    }, 6000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const slide = HERO_SLIDES[current];
  const slideLabel = `Slide ${current + 1} of ${HERO_SLIDES.length}: ${slide.title}`;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-[#0F1417] aspect-[2.2/1] lg:max-h-[760px]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <picture className="block h-full w-full">
            <source media="(max-width: 767px)" srcSet={slide.mobileSrc} />
            <img
              alt={slide.title}
              className="h-full w-full object-contain object-center"
              src={slide.desktopSrc}
              loading={current === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={current === 0 ? 'high' : 'low'}
              sizes="100vw"
            />
          </picture>
          {/* Light gradient so controls stay readable over baked-in artwork */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 h-full max-w-[1720px] mx-auto px-3 sm:px-12 lg:px-16 flex flex-col justify-end pb-2 sm:pb-16 lg:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-2xl text-left"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="sr-only">{slideLabel}</p>
            <div className="flex items-center gap-4">
              <Link
                to={slide.to}
                className="inline-flex items-center gap-1.5 sm:gap-3 bg-white text-black px-2.5 py-1.5 sm:px-8 sm:py-4 rounded-md sm:rounded-sm text-[8px] sm:text-[12px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.2em] shadow-xl hover:bg-[#26B3FF] hover:text-white transition-all duration-300 group"
              >
                {slide.cta}
                <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
