/**
 * Google Analytics 4 (GA4) helper for SPA route tracking and e-commerce / marketplace conversion events.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-Z0DMD4Z3P9';

/**
 * Log page views on SPA route change
 */
export const pageview = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

/**
 * Generic event helper
 */
export const event = (action: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

/**
 * Outbound Marketplace Conversion Tracking
 */
export interface MarketplaceClickParams {
  marketplace: string;
  url: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  category?: string;
}

export const trackMarketplaceClick = ({
  marketplace,
  url,
  productId,
  productName,
  productPrice,
  category,
}: MarketplaceClickParams) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const itemData = {
    item_id: productId || 'unknown',
    item_name: productName || 'Product',
    item_category: category || 'Bags',
    price: productPrice || 0,
    quantity: 1,
  };

  // 1. Custom marketplace conversion event
  window.gtag('event', 'marketplace_outbound_click', {
    marketplace,
    destination_url: url,
    product_id: productId,
    product_name: productName,
    currency: 'INR',
    value: productPrice || 0,
    items: [itemData],
  });

  // 2. Standard GA4 conversion event (generate_lead)
  window.gtag('event', 'generate_lead', {
    lead_type: 'marketplace_referral',
    marketplace,
    currency: 'INR',
    value: productPrice || 0,
    items: [itemData],
  });

  // 3. E-commerce intent event (select_item)
  window.gtag('event', 'select_item', {
    item_list_name: `Marketplace - ${marketplace}`,
    items: [itemData],
  });
};

/**
 * Track Product View (view_item)
 */
export const trackViewItem = (product: {
  id: string;
  name: string;
  price?: number;
  category?: string;
}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'view_item', {
    currency: 'INR',
    value: product.price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Bags',
        price: product.price || 0,
        quantity: 1,
      },
    ],
  });
};

/**
 * Track Search (search event)
 */
export const trackSearch = (searchTerm: string, numberOfResults?: number) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !searchTerm?.trim()) return;

  window.gtag('event', 'search', {
    search_term: searchTerm.trim(),
    ...(typeof numberOfResults === 'number' ? { number_of_results: numberOfResults } : {}),
  });
};

/**
 * Track View Item List (view_item_list event)
 */
export interface ItemListProduct {
  id: string;
  name: string;
  price?: number;
  category?: string;
}

export const trackViewItemList = (params: {
  itemListId?: string;
  itemListName?: string;
  items: ItemListProduct[];
}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !params.items?.length) return;

  window.gtag('event', 'view_item_list', {
    item_list_id: params.itemListId,
    item_list_name: params.itemListName || params.itemListId || 'Products',
    items: params.items.map((p, index) => ({
      item_id: p.id,
      item_name: p.name,
      item_category: p.category || 'Bags',
      price: p.price || 0,
      index: index + 1,
    })),
  });
};

/**
 * Track Select Item from List (select_item event)
 */
export const trackSelectItem = (product: ItemListProduct, listName?: string, listId?: string) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'select_item', {
    item_list_name: listName || 'Products',
    item_list_id: listId,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Bags',
        price: product.price || 0,
      },
    ],
  });
};

