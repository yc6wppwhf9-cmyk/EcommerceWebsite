import React from 'react';
import { api } from '../lib/api';

interface AmazonLinkProps {
  url: string;
  productId?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * The "Buy on Amazon" CTA, rendered as a real anchor rather than a window.open() call.
 *
 * This is what makes the handoff to the installed Amazon app work. iOS Universal Links
 * and Android App Links only fire on a genuine user-initiated navigation — a tab opened
 * from script stays in the browser, so window.open() always kept the customer on the web.
 * Our product URLs are plain https://www.amazon.in/dp/<ASIN>, which the Amazon app claims,
 * so the OS routes the tap to the app when it's installed and to the browser when it isn't.
 * No custom URL scheme or fallback timer needed.
 *
 * Click tracking still fires: trackAmazonClick uses sendBeacon, which survives the page
 * being backgrounded when the app takes over.
 */
export const AmazonLink = ({ url, productId, className, style, children }: AmazonLinkProps) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => {
      e.stopPropagation();
      if (productId) api.trackAmazonClick(productId);
    }}
    className={className}
    style={style}
  >
    {children}
  </a>
);
