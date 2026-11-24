import { useLocation } from 'react-router-dom';
import { SEO } from './SEO';
import { PAGES, SITE, isPrivate } from '../seo/routes';

// Title, description and canonical for routes whose page component doesn't
// render its own <SEO>, and noindex for private pages. A page's own <SEO>
// mounts deeper and takes precedence.

const BASE = SITE;

// These pages render their own <SEO>; the shared list only feeds the crawler middleware for them.
const OWN_SEO = new Set(['/about', '/contact', '/careers', '/corporate-gifting']);

export const RouteSEO = () => {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';

  if (isPrivate(path)) {
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

  const page = OWN_SEO.has(path) ? undefined : PAGES[path];
  return page ? <SEO title={page.title} description={page.description} url={`${BASE}${path}`} /> : null;
};
