import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BACKPACK_TABS } from '../constants/home';
import type { Product } from '../types';

// ─── Hook ────────────────────────────────────────────────────────────────────

interface HomeData {
  tabProducts: Product[];
  tabLoading: boolean;
  /** `null` while checking, then `true`/`false`. */
  hasProducts: boolean | null;
}

export function useHomeData(activeTab: string): HomeData {
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(true);
  const [hasProducts, setHasProducts] = useState<boolean | null>(null);

  // Tab products — fetch active tab immediately
  useEffect(() => {
    setTabLoading(true);
    setTabProducts([]);
    const tab = BACKPACK_TABS.find((t) => t.id === activeTab);
    const params: Record<string, string> = { ...(tab?.apiParams ?? { category: activeTab }), limit: '8' };

    api.getProducts(params)
      .then((res) => {
        const list = (res.products as Product[]).slice(0, 8);
        setTabProducts(list);
        setHasProducts(list.length > 0);
      })
      .catch(() => setHasProducts(false))
      .finally(() => setTabLoading(false));
  }, [activeTab]);

  return { tabProducts, tabLoading, hasProducts };
}
