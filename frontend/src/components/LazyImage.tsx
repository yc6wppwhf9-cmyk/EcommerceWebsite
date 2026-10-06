import React, { useLayoutEffect, useRef, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  className?: string;
  skeletonClassName?: string;
  priority?: boolean;
  fallbackSrc?: string;
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
  fallbackSrc,
  ...rest
}) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const optimizedSrc = hasError ? imgSrc : optimizeGoogleUrl(imgSrc, width);
  // Tied to the source actually shown, so a stale reset can never hide an
  // image whose load event already fired.
  const loaded = hasError || loadedSrc === optimizedSrc;

  // Cached images can finish loading before React attaches onLoad.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoadedSrc(optimizedSrc);
  }, [optimizedSrc]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${skeletonClassName}`}
        />
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoadedSrc(optimizedSrc)}
        onError={handleError}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
};
