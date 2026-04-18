import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
}

const BASE_URL = 'https://prioritybags.in';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({ title, description, image = DEFAULT_IMAGE, url = BASE_URL, type = 'website' }: SEOProps) => {
  const fullTitle = title.includes('Priority Bags') ? title : `${title} | Priority Bags`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === 'product' ? 'og:product' : 'website'} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
