import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { event } from '../lib/gtag';

// Full-screen brand film shown when someone opens the site. Muted autoplay
// (browsers block sound until the visitor taps), Skip + sound buttons, closes
// itself at the end, and appears at most once a day per device.

const SEEN_KEY = 'pb_intro_seen_at';
const ONCE_PER_MS = 24 * 60 * 60 * 1000;
const SRC = '/optimized/intro/brand-intro';

function shouldShow() {
  if (typeof window === 'undefined') return false;
  if (location.pathname.startsWith('/admin')) return false;
  if ((navigator as any).connection?.saveData) return false; // visitor asked to save data
  if (navigator.webdriver) return false; // automated browsers / crawlers
  try {
    const last = Number(localStorage.getItem(SEEN_KEY) || 0);
    return Date.now() - last > ONCE_PER_MS;
  } catch {
    return false; // storage blocked: don't risk replaying it on every page
  }
}

export const IntroVideo = () => {
  const [open, setOpen] = useState(shouldShow);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = (how: 'completed' | 'skipped') => {
    if (leaving) return;
    event('intro_video', { action: how });
    setLeaving(true);
    setTimeout(() => setOpen(false), 400);
  };

  useEffect(() => {
    if (!open) return;
    try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* storage blocked */ }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close('skipped'); };
    window.addEventListener('keydown', onKey);
    // If autoplay is blocked entirely, don't leave a frozen overlay up.
    videoRef.current?.play().catch(() => close('skipped'));
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Priority Bags brand film"
      className={`fixed inset-0 z-[300] flex items-center justify-center bg-black transition-opacity duration-400 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Desktop: blurred copy of the poster fills the sides of the portrait film */}
      <img
        src={`${SRC}-poster.webp`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-110 hidden md:block"
      />
      <video
        ref={videoRef}
        className="relative h-full w-full object-cover md:object-contain md:h-[92vh] md:w-auto md:rounded-xl md:shadow-2xl"
        poster={`${SRC}-poster.webp`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => close('completed')}
        onError={() => close('skipped')}
      >
        <source src={`${SRC}.webm`} type="video/webm" />
        <source src={`${SRC}.mp4`} type="video/mp4" />
      </video>

      <div className="absolute top-0 inset-x-0 flex justify-end gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          onClick={() => close('skipped')}
          className="flex h-11 items-center gap-1.5 rounded-full bg-white/90 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black hover:bg-white"
        >
          Skip <X size={14} />
        </button>
      </div>
    </div>
  );
};
