import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMG, BANNER_CTA } from '../../constants/home';
import type { GenderLink } from '../../constants/home';

interface EditorialBannerProps {
  hasProducts: boolean | null;
  genderStock: GenderLink[] | null;
}

/**
 * Editorial banner section.
 *
 * Adapts copy based on catalogue state:
 * - Live store → "New Arrival" with gender-filtered CTAs
 * - Empty store → "Launching Soon" with a "Notify Me" fallback
 *
 * Hidden until both checks resolve so the copy never flips mid-view.
 */
export const EditorialBanner = ({ hasProducts, genderStock }: EditorialBannerProps) => {
  if (hasProducts === null || genderStock === null) return null;

  const banner = hasProducts
    ? {
        heading: 'New Arrival',
        subheading: 'Ready For Your Journey',
        imageTo: '/backpacks' as string | null,
        links: genderStock.map(({ to, label }) => ({ to, label })),
      }
    : {
        heading: 'Launching Soon',
        subheading: 'Ready For Your Journey',
        imageTo: null as string | null,
        links: [{ to: '/contact', label: 'Notify Me' }],
      };

  return (
    <section className="relative bg-ink" aria-label={banner.heading}>
      {/* ─── Mobile ─────────────────────────────────────────────────────── */}
      <div className="md:hidden relative w-full overflow-hidden">
        <img src={IMG.banner} alt={banner.heading} className="w-full h-auto object-cover block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.35em] text-white mb-2">
            {banner.heading}
          </h2>
          <p className="text-[16px] font-outfit font-medium uppercase tracking-[0.2em] text-white/80 select-none mb-6">
            {banner.subheading}
          </p>
          {banner.links.length > 0 && (
            <div className="flex gap-6 mb-6">
              {banner.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[12px] font-bold uppercase tracking-widest border-b-2 border-white text-white pb-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          <Link
            to={BANNER_CTA.to}
            className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink"
          >
            {BANNER_CTA.label}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ─── Desktop ────────────────────────────────────────────────────── */}
      <div className="hidden md:block text-white relative py-4 lg:py-6">
        <div className="max-w-[1720px] mx-auto px-8 lg:px-12 relative z-10 flex flex-row items-center gap-10 lg:gap-16">
          {banner.imageTo ? (
            <Link
              to={banner.imageTo}
              className="w-[42%] lg:w-[40%] relative z-30 rounded-sm overflow-hidden -mt-8 -mb-8 block group"
            >
              <img
                src={IMG.banner}
                alt="Style"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
          ) : (
            <div className="w-[42%] lg:w-[40%] relative z-30 rounded-sm overflow-hidden -mt-8 -mb-8 block">
              <img src={IMG.banner} alt="Style" className="w-full h-auto object-cover" />
            </div>
          )}
          <div className="flex-1 text-left py-2">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-brass mb-2">
              Fresh picks for every trip
            </p>
            <h2 className="text-3xl lg:text-5xl font-normal uppercase tracking-[0.14em] text-white mb-3">
              {banner.heading}
            </h2>
            <p
              className={`text-[14px] lg:text-[15px] font-outfit font-normal uppercase tracking-[0.2em] text-white/50 select-none pointer-events-none ${
                banner.links.length ? 'mb-4' : ''
              }`}
            >
              {banner.subheading}
            </p>
            {banner.links.length > 0 && (
              <div className="flex gap-6">
                {banner.links.map((link) => (
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
            <Link
              to={BANNER_CTA.to}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-7 py-3 mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-transform duration-500 hover:-translate-y-0.5"
            >
              {BANNER_CTA.label}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
