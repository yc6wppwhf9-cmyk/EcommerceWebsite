import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  className?: string;
  skeletonClassName?: string;
  priority?: boolean;
}

// Appends Google CDN size param to reduce payload for large images
function optimizeGoogleUrl(src: string, width: number): string {
  if (!src) return src;
  if (src.includes('lh3.googleusercontent.com') || src.includes('googleusercontent.com')) {
    // Strip any existing size param before appending
    const base = src.replace(/=w\d+.*$/, '');
    return `${base}=w${width}`;
  }
  return src;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 600,
  className = '',
  skeletonClassName = '',
  priority = false,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimizedSrc = error ? src : optimizeGoogleUrl(src, width);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${skeletonClassName}`}
        />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
};
