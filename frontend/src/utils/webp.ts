import type React from 'react';

// Every JPEG in /optimized has a smaller WebP twin (scripts/optimize-home-images).
export const webp = (src: string) => (/^\/optimized\/.+\.jpg$/.test(src) ? src.replace(/\.jpg$/, '.webp') : src);

// For plain <img src={webp(...)}>: browsers without WebP fall back to the JPEG.
export const webpFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src.endsWith('.webp')) img.src = img.src.replace(/\.webp$/, '.jpg');
};
