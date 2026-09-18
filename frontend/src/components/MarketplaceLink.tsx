import React from 'react';
import { api } from '../lib/api';
import { trackMarketplaceClick } from '../lib/gtag';

export type Marketplace = 'amazon' | 'flipkart' | 'myntra' | 'ajio';

interface MarketplaceLinkProps {
  marketplace: Marketplace;
  url: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  category?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * The "Buy on <marketplace>" CTA, rendered as a real anchor rather than a window.open() call.
 *
 * This is what makes the handoff to the installed marketplace app work. iOS Universal Links
 * and Android App Links only fire on a genuine user-initiated navigation — a tab opened
 * from script stays in the browser, so window.open() always kept the customer on the web.
 * Product URLs point at the marketplace's own listing (Amazon ASIN, Flipkart PID, Myntra
 * style id), which the corresponding app claims, so the OS routes the tap to the app when
 * it's installed and to the browser when it isn't. No custom URL scheme or fallback timer
 * needed.
 *
 * Click tracking fires both:
 * 1. api.trackMarketplaceClick using sendBeacon for the backend DB counter
 * 2. trackMarketplaceClick for Google Analytics 4 conversion / key event tracking
 */
export const MarketplaceLink = ({
  marketplace,
  url,
  productId,
  productName,
  productPrice,
  category,
  className,
  style,
  children,
}: MarketplaceLinkProps) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => {
      e.stopPropagation();
      if (productId) api.trackMarketplaceClick(productId, marketplace);
      trackMarketplaceClick({
        marketplace,
        url,
        productId,
        productName,
        productPrice,
        category,
      });
    }}
    className={className}
    style={style}
  >
    {children}
  </a>
);

