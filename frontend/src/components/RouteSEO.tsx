import { useLocation } from 'react-router-dom';
import { SEO } from './SEO';

// Title, description and canonical for routes whose page component doesn't
// render its own <SEO>, and noindex for private pages. A page's own <SEO>
// mounts deeper and takes precedence.

const BASE = 'https://www.prioritybags.in';

const PAGES: Record<string, { title: string; description: string }> = {
  '/junior': {
    title: 'Junior School Bags for Kids — Priority Junior',
    description: 'School bags, trolley backpacks and combo sets for kids from Priority Junior. Shop by age and character, with delivery across India.',
  },
  '/premium': {
    title: 'TRAWORLD Premium Luggage, Backpacks & Duffles',
    description: 'TRAWORLD premium travel collection by Priority Bags: hard-shell luggage, travel backpacks and duffles built for frequent travellers.',
  },
  '/shipping': {
    title: 'Shipping Policy',
    description: 'How Priority Bags orders are shipped and delivered across India, including marketplace orders on Amazon, Myntra and Ajio.',
  },
  '/returns': {
    title: 'Returns & Refunds',
    description: 'Returns, replacements and refunds for Priority Bags and TRAWORLD products bought online.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How Priority Bags (High Spirit Commercial Ventures Pvt. Ltd.) collects, uses and protects your information.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Terms of use for the Priority Bags website, operated by High Spirit Commercial Ventures Pvt. Ltd.',
  },
  '/warranty': {
    title: 'Claim Warranty',
    description: 'Register a warranty claim for a Priority Bags or TRAWORLD product. Our support team will get back to you.',
  },
  '/support-status': {
    title: 'Check Support Request Status',
    description: 'Check the status of your Priority Bags support or warranty request with your ticket number.',
  },
};

const PRIVATE = ['/login', '/forgot-password', '/reset-password', '/verify-email', '/account', '/admin', '/checkout', '/wishlist'];

export const RouteSEO = () => {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';

  if (PRIVATE.some((p) => path === p || path.startsWith(`${p}/`))) {
    return <SEO title="Priority Bags" description="Priority Bags" url={`${BASE}${path}`} noindex />;
  }

  const style = path.match(/^\/junior\/([^/]+)$/)?.[1];
  if (style) {
    const name = decodeURIComponent(style).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <SEO
        title={`${name} School Bags for Kids — Priority Junior`}
        description={`${name} school bags and backpacks for kids from Priority Junior, with delivery across India.`}
        url={`${BASE}${path}`}
      />
    );
  }

  const page = PAGES[path];
  return page ? <SEO title={page.title} description={page.description} url={`${BASE}${path}`} /> : null;
};
