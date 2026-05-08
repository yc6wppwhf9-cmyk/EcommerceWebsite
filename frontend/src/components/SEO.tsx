import { Helmet } from 'react-helmet-async';

interface ProductSEOData {
  price: number;
  originalPrice?: number;
  stock: number;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  slug?: string;
}

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  product?: ProductSEOData;
}

const BASE_URL = 'https://prioritybags.in';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({ title, description, image = DEFAULT_IMAGE, url = BASE_URL, type = 'website', product }: SEOProps) => {
  const fullTitle = title.includes('Priority Bags') ? title : `${title} | Priority Bags`;

  const productJsonLd = type === 'product' && product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image,
    ...(product.sku && { sku: product.sku }),
    brand: { '@type': 'Brand', name: 'Priority Bags' },
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Priority Bags' },
    },
    ...(product.rating && product.reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
      }
    } : {}),
  } : null;

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
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Product JSON-LD */}
      {productJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      )}
    </Helmet>
  );
};
