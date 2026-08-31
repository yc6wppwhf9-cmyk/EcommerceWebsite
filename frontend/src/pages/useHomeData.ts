import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BACKPACK_TABS, GENDER_LINKS } from '../constants/home';
import type { Product } from '../types';
import type { GenderLink } from '../constants/home';

// ─── Prefetch ────────────────────────────────────────────────────────────────
// Warm the SWR cache for every tab + best sellers + stock checks in parallel.
// Called once on module load so tab switches resolve from cache instantly.
const prefetchHomeData = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const fetches = [
      ...BACKPACK_TABS.map((tab) => {
        const params: Record<string, string> = { ...tab.apiParams, limit: '20' };
        return api.getProducts(params).catch(() => {});
      }),
      api.getProducts({ sort: 'bestseller', limit: '12', isPremium: 'false' }).catch(() => {}),
      api.getProducts({ limit: '1' }).catch(() => {}),
      ...GENDER_LINKS.map((link) =>
        api.getProducts({ gender: link.gender, isPremium: 'false', limit: '1' }).catch(() => {})
      ),
    ];
    Promise.all(fetches).catch(() => {});
  };
})();

// ─── Hook ────────────────────────────────────────────────────────────────────

interface HomeData {
  tabProducts: Product[];
  tabLoading: boolean;
  bestSellers: Product[];
  /** `null` while checking, then `true`/`false`. */
  hasProducts: boolean | null;
  /** `null` while checking, then the subset of GENDER_LINKS that have stock. */
  genderStock: GenderLink[] | null;
}

export function useHomeData(activeTab: string): HomeData {
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [hasProducts, setHasProducts] = useState<boolean | null>(null);
  const [genderStock, setGenderStock] = useState<GenderLink[] | null>(null);

  // Prefetch all data on first render
  useEffect(() => {
    prefetchHomeData();
  }, []);

  // Tab products — resolves from cache instantly if prefetch already ran
  useEffect(() => {
    setTabLoading(true);
    setTabProducts([]);
    const tab = BACKPACK_TABS.find((t) => t.id === activeTab);
    const params: Record<string, string> = { ...(tab?.apiParams ?? { category: activeTab }), limit: '20' };

    api.getProducts(params)
      .then((res) => {
        setTabProducts((res.products as Product[]).slice(0, 15));
      })
      .catch(() => {})
      .finally(() => setTabLoading(false));
  }, [activeTab]);

  // Best sellers
  useEffect(() => {
    api.getProducts({ sort: 'bestseller', limit: '12', isPremium: 'false' })
      .then((res) => {
        const filtered = (res.products as Product[]).filter(
          (p) => p.categories?.slug !== 'junior'
        );
        setBestSellers(filtered.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  // Cheapest possible existence check — one row is enough to know the store is live
  useEffect(() => {
    api.getProducts({ limit: '1' })
      .then((res) => setHasProducts((res.products?.length ?? 0) > 0))
      .catch(() => setHasProducts(false));
  }, []);

  // Gender stock checks — only show CTAs whose queries return real products
  useEffect(() => {
    Promise.all(
      GENDER_LINKS.map((link) =>
        api.getProducts({ gender: link.gender, isPremium: 'false', limit: '1' })
          .then((res) => (res.products?.length ?? 0) > 0)
          .catch(() => false)
      )
    ).then((results) => {
      const available = GENDER_LINKS.filter((_, i) => results[i]);
      setGenderStock(available as GenderLink[]);
    });
  }, []);

  return { tabProducts, tabLoading, bestSellers, hasProducts, genderStock };
}
