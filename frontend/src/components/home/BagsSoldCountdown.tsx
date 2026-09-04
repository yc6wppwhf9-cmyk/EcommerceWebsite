import { useEffect, useRef, useState } from 'react';

/**
 * "Bags Sold" live counter strip.
 *
 * A headline odometer counts up to a base figure the first time the strip
 * scrolls into view, then keeps ticking upward slowly so the number feels
 * live. Supporting stats sit alongside. Honours `prefers-reduced-motion` by
 * skipping the count-up animation and rendering the final values immediately.
 */

// Base figure the odometer settles on before the slow live drift begins.
const BAGS_SOLD_BASE = 128_540;

const STATS = [
  { value: 4.8, suffix: '★', label: 'Average Rating', decimals: 1 },
  { value: 50000, suffix: '+', label: 'Happy Travellers', decimals: 0 },
  { value: 25, suffix: '+', label: 'Years of Craft', decimals: 0 },
] as const;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const formatInt = (n: number) => Math.round(n).toLocaleString('en-IN');

function useCountUp(target: number, active: boolean, duration = 1600, decimals = 0) {
  const [value, setValue] = useState(active && !prefersReducedMotion() ? 0 : target);

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const current = target * eased;
      setValue(Number(current.toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, decimals]);

  return value;
}

export const BagsSoldCountdown = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [drift, setDrift] = useState(0);

  // Reveal the counters the first time the strip enters the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Slow "live" drift once the count-up has finished.
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const id = setInterval(() => setDrift((d) => d + Math.floor(Math.random() * 3) + 1), 4000);
    return () => clearInterval(id);
  }, [inView]);

  const bagsSold = useCountUp(BAGS_SOLD_BASE, inView, 2000);

  return (
    <section
      ref={sectionRef}
      className="bg-ink text-white font-outfit py-14 md:py-20"
      aria-label="Bags sold counter"
    >
      <div className="max-w-[1720px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Headline odometer */}
          <div className="text-center lg:text-left">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#26B3FF] mb-3">
              Trusted by travellers everywhere
            </p>
            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <span className="font-outfit font-bold tracking-tight tabular-nums text-[52px] leading-none sm:text-[72px] md:text-[92px]">
                {formatInt(bagsSold + drift)}
              </span>
            </div>
            <p className="mt-3 text-[14px] md:text-[16px] font-medium text-white/70">
              bags sold and counting — join the journey.
            </p>
          </div>

          {/* Supporting stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {STATS.map((s) => (
              <Stat key={s.label} {...s} active={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({
  value,
  suffix,
  label,
  decimals,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals: number;
  active: boolean;
}) => {
  const n = useCountUp(value, active, 1600, decimals);
  const display = decimals > 0 ? n.toFixed(decimals) : formatInt(n);

  return (
    <div className="text-center lg:text-left">
      <div className="font-outfit font-bold tabular-nums text-[24px] sm:text-[30px] md:text-[38px] leading-none">
        {display}
        <span className="text-[#26B3FF]">{suffix}</span>
      </div>
      <p className="mt-1.5 text-[10px] md:text-[12px] font-medium uppercase tracking-[0.12em] text-white/50 leading-tight">
        {label}
      </p>
    </div>
  );
};
