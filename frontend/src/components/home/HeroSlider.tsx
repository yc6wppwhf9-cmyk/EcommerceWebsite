import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
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

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % HERO_SLIDES.length);
    startTimer(); // reset auto-advance after manual interaction
  }, [startTimer]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    startTimer();
  }, [startTimer]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
      startTimer();
    },
    [startTimer]
  );

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
      className="relative w-full bg-white overflow-hidden aspect-[16/9] sm:aspect-auto sm:h-[calc(100vh-4rem)] sm:max-h-[620px] sm:min-h-[480px] lg:max-h-[760px]"
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
          <img
            alt={slide.title}
            className="w-full h-full object-cover object-top"
            src={slide.src}
            loading="eager"
          />
          {/* Light gradient so controls stay readable over baked-in artwork */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 h-full max-w-[1720px] mx-auto px-4 sm:px-12 lg:px-16 flex flex-col justify-end pb-3 sm:pb-16 lg:pb-20">
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
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black px-3.5 py-2 sm:px-8 sm:py-4 rounded-sm text-[9.5px] sm:text-[12px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] shadow-xl hover:bg-[#26B3FF] hover:text-white transition-all duration-300 group"
              >
                {slide.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/20 rounded-full items-center justify-center bg-black/40 hover:bg-white hover:text-gray-900 backdrop-blur-md transition-all duration-300 text-white group"
      >
        <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 border border-white/20 rounded-full items-center justify-center bg-black/40 hover:bg-white hover:text-gray-900 backdrop-blur-md transition-all duration-300 text-white group"
      >
        <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots & Slide Counter */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-12 z-30 flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-2 rounded-full border border-white/15">
        <span className="text-[9px] sm:text-[11px] font-bold tracking-widest text-white/90">
          {String(current + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
        </span>
        <div className="w-px h-2.5 sm:h-3 bg-white/20" />
        <div className="flex gap-1 sm:gap-1.5" role="tablist" aria-label="Slide indicators">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-4 sm:w-6 bg-[#26B3FF]' : 'w-1 sm:w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
