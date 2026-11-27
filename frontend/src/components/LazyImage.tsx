import React, { useLayoutEffect, useRef, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  className?: string;
  skeletonClassName?: string;
  /** Above-the-fold image: load immediately, at high priority, without the fade-in. */
  priority?: boolean;
  fallbackSrc?: string;
}

/**
 * A copy of the image sized for `width` CSS pixels, from whichever host serves it.
 * Product photos are often 1500px+ originals; cards show them about 180-300px wide.
 */
export function sizedImageUrl(src: string, width: number): string {
  if (!src) return src;
  // Google CDN: size param
  if (src.includes('googleusercontent.com')) return `${src.replace(/=w\d+.*$/, '')}=w${width}`;
  // Amazon: size suffix before the extension (…/I/ID._SL500_.jpg)
  const amazon = src.match(/^(https:\/\/m\.media-amazon\.com\/images\/I\/[^./]+)(?:\.[^/]*)?\.(jpg|jpeg|png)$/i);
  if (amazon) return `${amazon[1]}._SL${width}_.${amazon[2]}`;
  // Myntra: transformation segment after the host
  if (/^https:\/\/assets\.myntassets\.com\/assets\//.test(src)) {
    return src.replace('assets.myntassets.com/assets/', `assets.myntassets.com/f_webp,w_${width},q_80/v1/assets/`);
  }
  // Cloudinary: transformation after /upload/ (unless one is already there)
  if (/res\.cloudinary\.com\/.+\/image\/upload\/(?!([a-z]_[^/]*,?)+\/)/.test(src)) {
    return src.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
  }
  // Our own product photos: 480px WebP copies in /thumbs (scripts/make-thumbnails.py)
  if (width <= 600 && /^\/products\/.+\.(jpe?g|png|webp)$/i.test(src)) {
    return `/thumbs${src.replace(/\.(jpe?g|png|webp)$/i, '.webp')}`;
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
  // A resized copy failed (e.g. no thumbnail yet): fall back to the original.
  const [original, setOriginal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setOriginal(false);
  }, [src]);

  const sized = sizedImageUrl(imgSrc, width);
  const optimizedSrc = hasError || original ? imgSrc : sized;
  // Tied to the source actually shown, so a stale reset can never hide an
  // image whose load event already fired.
  const loaded = priority || hasError || loadedSrc === optimizedSrc;

  // Cached images can finish loading before React attaches onLoad.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoadedSrc(optimizedSrc);
  }, [optimizedSrc]);

  const handleError = () => {
    if (!original && sized !== imgSrc) {
      setOriginal(true);
    } else if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setOriginal(false);
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
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoadedSrc(optimizedSrc)}
        onError={handleError}
        className={`${priority ? '' : 'transition-opacity duration-300'} ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
};
