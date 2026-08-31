import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, PackageCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../constants/products';
import { BACKPACK_TABS as TABS } from '../../constants/home';
import { ProductCard } from '../ProductCard';
import { LazyImage } from '../LazyImage';
import type { Product } from '../../types';
import type { ColumnTier } from '../../constants/home';

interface BackpackTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabProducts: Product[];
  tabLoading: boolean;
  columns: ColumnTier;
}

/**
 * Tabbed backpack product section.
 *
 * ARIA: tabs use role="tab" / aria-selected, grid uses role="tabpanel".
 */
export const BackpackTabs = ({
  activeTab,
  setActiveTab,
  tabProducts,
  tabLoading,
  columns,
}: BackpackTabsProps) => {
  const [tabPage, setTabPage] = useState(0);

  const activeTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];
  const tabCategory = CATEGORIES.find((c) => c.slug === activeTab);

  const tabPageCount = Math.max(1, Math.ceil(tabProducts.length / columns.tabs));

  // Reset page when tab or products change
  useEffect(() => {
    setTabPage(0);
  }, [activeTab]);

  // Widening the window can strand tabPage past the end
  useEffect(() => {
    setTabPage((p) => Math.min(p, tabPageCount - 1));
  }, [tabPageCount]);

  const tabPanelId = `tabpanel-${activeTab}`;

  return (
    <section className="pt-10 md:pt-20 pb-12 md:pb-16 bg-bone" aria-label="Browse backpacks">
      <div className="max-w-[1720px] mx-auto px-4 md:px-10 lg:px-14">
        <div className="relative">
          {/* Tab Bar */}
          <div
            className="flex gap-1.5 md:gap-3 border border-line bg-white p-1.5 rounded-sm mb-7 md:mb-10"
            role="tablist"
            aria-label="Backpack categories"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tabPanelId}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 h-11 px-2 md:px-5 rounded-sm text-[11px] md:text-[12px] font-medium uppercase tracking-[0.16em] md:tracking-[0.18em] transition-colors whitespace-nowrap text-center ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-black'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="homeActiveTab"
                    className="absolute inset-0 bg-ink rounded-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  <span className="md:hidden">{tab.label.replace(/\s*backpack$/i, '')}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: featured card */}
        {tabCategory && (
          <div className="md:hidden flex items-center gap-4 p-3 mb-5 rounded-lg overflow-hidden bg-[#F8BE57]">
            <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-white/30">
              <LazyImage
                src={activeTabConfig.image}
                alt={activeTabConfig.label}
                className="w-full h-full object-cover"
                width={80}
              />
            </div>
            <div className="text-white font-outfit min-w-0">
              <p className="font-medium uppercase text-[10px] tracking-[0.24em] text-brass">Featured</p>
              <p className="font-normal uppercase text-[17px] tracking-[0.06em] leading-tight truncate">
                {activeTabConfig.label}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          {/* Sidebar poster card */}
          <Link
            to={activeTabConfig.to}
            className="hidden md:flex flex-col h-auto overflow-hidden relative group rounded-sm bg-white border border-line transition-transform duration-500 ease-out hover:-translate-y-1"
          >
            <div
              className="relative overflow-hidden bg-white flex items-center justify-center p-4"
              style={{ aspectRatio: '1/1.1' }}
            >
              <div className="absolute inset-0 border border-line z-10" />
              <LazyImage
                src={activeTabConfig.image}
                alt={activeTabConfig.label}
                className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                width={520}
              />
            </div>
            <div className="px-5 py-4 bg-ink flex items-center justify-between">
              <div>
                <p className="font-medium uppercase tracking-[0.24em] leading-none text-[10px] text-brass mb-2">
                  Trendy
                </p>
                <p className="font-normal uppercase tracking-[0.06em] leading-snug text-[15px] lg:text-[16px] text-white max-w-[220px]">
                  {activeTabConfig.label}
                </p>
              </div>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:translate-x-1 flex-shrink-0">
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Product grid */}
          <div
            className="min-w-0 relative"
            role="tabpanel"
            id={tabPanelId}
            aria-labelledby={`tab-${activeTab}`}
          >
            {/* Pagination arrows */}
            {tabProducts.length > columns.tabs && (
              <>
                <button
                  onClick={() => setTabPage((p) => Math.max(0, p - 1))}
                  disabled={tabPage === 0}
                  className="hidden md:flex absolute left-0 top-[35%] -translate-x-1/2 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-colors duration-300 z-30 rounded-full border border-line disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                  aria-label="Previous products"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setTabPage((p) => Math.min(tabPageCount - 1, p + 1))}
                  disabled={tabPage >= tabPageCount - 1}
                  className="hidden md:flex absolute right-0 top-[35%] translate-x-1/2 w-11 h-11 bg-white hover:bg-ink hover:text-white items-center justify-center transition-colors duration-300 z-30 rounded-full border border-line disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-current"
                  aria-label="Next products"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {tabLoading ? (
              <>
                {/* Mobile skeleton */}
                <div className="md:hidden grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n}>
                      <div className="aspect-[300/307] bg-gray-100 animate-pulse rounded-lg" />
                      <div className="mt-3 h-4 w-4/5 bg-gray-100 animate-pulse rounded" />
                      <div className="mt-3 h-9 w-full bg-gray-100 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
                {/* Desktop skeleton */}
                <div className={`hidden md:grid gap-6 ${columns.tabsClass}`}>
                  {Array.from({ length: columns.tabs }, (_, n) => (
                    <div key={n}>
                      <div className="aspect-[300/307] bg-gray-100 animate-pulse rounded-lg" />
                      <div className="mt-4 h-4 w-4/5 bg-gray-100 animate-pulse rounded" />
                      <div className="mt-3 h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                      <div className="mt-4 h-10 w-full bg-gray-100 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </>
            ) : tabProducts.length > 0 ? (
              <>
                {/* Mobile: 2-column grid */}
                <div className="md:hidden grid grid-cols-2 gap-3 pb-2">
                  {tabProducts.slice(0, 6).map((p) => (
                    <div key={p.id} className="min-w-0">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
                {/* Desktop: paginated grid */}
                <div className={`hidden md:grid gap-6 ${columns.tabsClass}`}>
                  {tabProducts
                    .slice(tabPage * columns.tabs, tabPage * columns.tabs + columns.tabs)
                    .map((p) => (
                      <div key={p.id} className="min-w-0">
                        <ProductCard product={p} />
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="w-full min-h-[320px] rounded-sm border border-dashed border-line bg-white flex flex-col items-center justify-center text-center px-6">
                <PackageCheck size={30} className="text-marine mb-4" />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink mb-2">
                  Fresh stock coming soon
                </p>
                <Link
                  to={activeTabConfig.to}
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-marine"
                >
                  View category <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
