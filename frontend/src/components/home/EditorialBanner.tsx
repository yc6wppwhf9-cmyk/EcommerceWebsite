import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IMG, BANNER_CTA } from '../../constants/home';
import type { GenderLink } from '../../constants/home';

interface EditorialBannerProps {
  hasProducts: boolean | null;
  genderStock: GenderLink[] | null;
}

interface EditorialSlide {
  id: string;
  image: string;
  badge: string;
  heading: string;
  subheading: string;
  links: { to: string; label: string }[];
  cta: { to: string; label: string };
  imageTo: string;
}

/**
 * Editorial banner section with automatic cycling banners.
 *
 * Showcases rotating New Arrival collections:
 * 1. Travel Luggage & Suitcases
 * 2. Campus & Laptop Backpacks
 * 3. School & Junior Series
 * 4. Traworld Luxe Hardsided Spinnners
 */
export const EditorialBanner: React.FC<EditorialBannerProps> = ({ hasProducts, genderStock }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute slides unconditionally so hook count never changes between renders
  const slides: EditorialSlide[] = React.useMemo(() => {
    const isStoreReady = hasProducts !== false;
    if (!isStoreReady) {
      return [
        {
          id: 'launching-soon',
          image: IMG.banner,
          badge: 'Fresh picks for every trip',
          heading: 'Launching Soon',
          subheading: 'Ready For Your Journey',
          links: [{ to: '/contact', label: 'Notify Me' }],
          cta: { to: '/contact', label: 'Get Notified' },
          imageTo: '/contact',
        },
      ];
    }

    const validGenderLinks =
      genderStock && genderStock.length > 0
        ? genderStock.map(({ to, label }) => ({ to, label }))
        : [
            { to: '/women', label: 'Shop Women' },
            { to: '/men', label: 'Shop Men' },
          ];

    return [
      {
        id: 'luggage-trip',
        image: IMG.banner,
        badge: 'Fresh picks for every trip',
        heading: 'New Arrival',
        subheading: 'Ready For Your Journey',
        links: validGenderLinks,
        cta: { to: BANNER_CTA.to, label: BANNER_CTA.label },
        imageTo: '/luggage',
      },
      {
        id: 'backpacks-urban',
        image: '/Category/Backpack.jpg',
        badge: 'Ergonomic Commute & Campus',
        heading: 'New Arrival',
        subheading: 'Engineered For Modern Lifestyles',
        links: [
          { to: '/college-backpacks', label: 'College' },
          { to: '/laptop-backpacks', label: 'Laptop' },
          { to: '/trekking-backpacks', label: 'Trekking' },
        ],
        cta: { to: '/backpacks', label: 'Explore Backpacks' },
        imageTo: '/backpacks',
      },
      {
        id: 'junior-school',
        image: IMG.refPoster,
        badge: '2026 School & Junior Series',
        heading: 'New Arrival',
        subheading: 'Smart Storage, Lightweight Comfort',
        links: [
          { to: '/junior', label: 'Junior Collection' },
          { to: '/junior/3to5', label: 'Ages 3-5' },
        ],
        cta: { to: '/junior', label: 'Shop Junior' },
        imageTo: '/junior',
      },
      {
        id: 'traworld-luxe',
        image: '/Traworld/section 2.png',
        badge: 'Traworld Luxury Hardshell',
        heading: 'New Arrival',
        subheading: 'Unmatched Luxury & Silent Gliding',
        links: [
          { to: '/premium', label: 'Traworld Luxe' },
          { to: '/luggage', label: 'All Luggage' },
        ],
        cta: { to: '/premium', label: 'Discover Luxe' },
        imageTo: '/premium',
      },
    ];
  }, [hasProducts, genderStock]);

  const total = slides.length;

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % total);
    startAutoPlay();
  }, [total, startAutoPlay]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
    startAutoPlay();
  }, [total, startAutoPlay]);

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

  const active = slides[currentSlide] || slides[0];

  return (
    <section className="relative bg-ink overflow-hidden" aria-label={active.heading}>
      {/* ─── Mobile ─────────────────────────────────────────────────────── */}
      <div className="md:hidden relative w-full overflow-hidden min-h-[420px] flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img src={active.image} alt={active.heading} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-6 pb-12">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-brass mb-1.5">
            {active.badge}
          </p>
          <h2 className="text-[14px] font-medium uppercase tracking-[0.35em] text-white mb-1.5">
            {active.heading}
          </h2>
          <p className="text-[15px] font-outfit font-medium uppercase tracking-[0.16em] text-white/80 select-none mb-5 leading-snug">
            {active.subheading}
          </p>
          {active.links.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-5">
              {active.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[11px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link
              to={active.cta.to}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink"
            >
              {active.cta.label}
              <ArrowRight size={13} />
            </Link>

            {/* Mobile slide dots */}
            {total > 1 && (
              <div className="flex gap-1.5 items-center">
                {slides.map((s, idx) => (
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
            )}
          </div>
        </div>
      </div>

      {/* ─── Desktop ────────────────────────────────────────────────────── */}
      <div className="hidden md:block text-white relative py-6 lg:py-10">
        <div className="max-w-[1720px] mx-auto px-8 lg:px-12 relative z-10 flex flex-row items-center gap-10 lg:gap-16">
          {/* Left Poster Container with Auto-Transition */}
          <div className="w-[42%] lg:w-[40%] relative z-30 -mt-6 -mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-sm overflow-hidden bg-black/40 border border-white/10 shadow-2xl aspect-[4/3] max-h-[380px] flex items-center justify-center"
              >
                <Link to={active.imageTo} className="w-full h-full block group">
                  <img
                    src={active.image}
                    alt={active.heading}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Content Column with Text Cross-Fade */}
          <div className="flex-1 text-left py-2 min-h-[220px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-brass mb-2">
                  {active.badge}
                </p>
                <h2 className="text-3xl lg:text-5xl font-normal uppercase tracking-[0.14em] text-white mb-3">
                  {active.heading}
                </h2>
                <p className="text-[14px] lg:text-[15px] font-outfit font-normal uppercase tracking-[0.2em] text-white/60 select-none mb-5">
                  {active.subheading}
                </p>
                {active.links.length > 0 && (
                  <div className="flex gap-6 mb-5">
                    {active.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-xs font-bold uppercase tracking-widest border-b-2 border-white pb-1 hover:opacity-70 transition-all"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-6 mt-2">
                  <Link
                    to={active.cta.to}
                    className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-transform duration-500 hover:-translate-y-0.5"
                  >
                    {active.cta.label}
                    <ArrowRight size={15} />
                  </Link>

                  {/* Navigation Arrows */}
                  {total > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        aria-label="Previous banner"
                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-ink transition-colors cursor-pointer text-white"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleNext}
                        aria-label="Next banner"
                        className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-ink transition-colors cursor-pointer text-white"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop Slide Dots Indicator */}
            {total > 1 && (
              <div className="flex items-center gap-2 mt-6">
                {slides.map((s, idx) => (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
