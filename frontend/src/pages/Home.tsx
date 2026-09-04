import { useState, useEffect } from 'react';
import { COLUMN_TIERS } from '../constants/home';
import { useHomeData } from './useHomeData';
import { HeroSlider } from '../components/home/HeroSlider';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { EditorialBanner } from '../components/home/EditorialBanner';
import { BackpackTabs } from '../components/home/BackpackTabs';
import { BestSellers } from '../components/home/BestSellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { BagsSoldCountdown } from '../components/home/BagsSoldCountdown';
import { InstagramShowcase } from '../components/home/InstagramShowcase';
import { SEO } from '../components/SEO';
import type { ColumnTier } from '../constants/home';

// ─── Responsive column tier hook ─────────────────────────────────────────────
// Tracks which tier the viewport is in. Needed in JS (not just CSS) because the
// grids are paginated — the slice size has to agree with the column count.
const useColumnTier = (): ColumnTier => {
  const [tier, setTier] = useState<ColumnTier>(COLUMN_TIERS[0]);

  useEffect(() => {
    const queries = COLUMN_TIERS.slice(1).map((t) => ({
      t,
      mq: window.matchMedia(`(min-width: ${t.min}px)`),
    }));
    const update = () => {
      const matched = queries.filter((q) => q.mq.matches).map((q) => q.t);
      setTier(matched.length ? matched[matched.length - 1] : COLUMN_TIERS[0]);
    };
    update();
    queries.forEach((q) => q.mq.addEventListener('change', update));
    return () => queries.forEach((q) => q.mq.removeEventListener('change', update));
  }, []);

  return tier;
};

// ─── Home Page ───────────────────────────────────────────────────────────────

export const Home = () => {
  const [activeTab, setActiveTab] = useState('college-backpacks');
  const columns = useColumnTier();
  const { tabProducts, tabLoading, bestSellers, newArrivals, hasProducts, genderStock } = useHomeData(activeTab);

  // Ensure we're on the light theme (Junior / Premium pages toggle dark)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <main className="font-outfit">
      <SEO
        title="Priority Bags — Premium Backpacks, Luggage & Travel Accessories"
        description="Shop Priority Bags for premium backpacks, travel luggage, and accessories. Free shipping across India. Trusted by thousands of travellers."
        url="https://prioritybags.in"
      />

      <HeroSlider />
      <CategoryShowcase />
      <EditorialBanner hasProducts={hasProducts} genderStock={genderStock} />

      <BackpackTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabProducts={tabProducts}
        tabLoading={tabLoading}
        columns={columns}
      />

      <BestSellers products={bestSellers} columns={columns} />
      <NewArrivals products={newArrivals} columns={columns} />
      <BagsSoldCountdown />
      <InstagramShowcase />
    </main>
  );
};
