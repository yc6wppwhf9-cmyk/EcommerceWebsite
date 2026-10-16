import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { event } from '../lib/gtag';

// Small floating brand-film player in the bottom-left corner. Plays muted on a
// loop without blocking the page; tapping the video toggles sound, X hides it.
// Once closed it stays hidden on that device for a day.

const CLOSED_KEY = 'pb_intro_closed_at';
const HIDE_FOR_MS = 24 * 60 * 60 * 1000;
const SRC = '/optimized/intro/brand-intro';

function shouldShow() {
  if (typeof window === 'undefined') return false;
  if (location.pathname.startsWith('/admin')) return false;
  if ((navigator as any).connection?.saveData) return false; // visitor asked to save data
  if (navigator.webdriver) return false; // automated browsers / crawlers
  try {
    return Date.now() - Number(localStorage.getItem(CLOSED_KEY) || 0) > HIDE_FOR_MS;
  } catch {
    return true;
  }
}

export const IntroVideo = () => {
  const [open, setOpen] = useState(shouldShow);
  const [shown, setShown] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setShown(true), 50); // slide in after first paint
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const close = () => {
    try { localStorage.setItem(CLOSED_KEY, String(Date.now())); } catch { /* storage blocked */ }
    event('intro_video', { action: 'closed' });
    setShown(false);
    setTimeout(() => setOpen(false), 300);
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) {
      v.currentTime = 0; // start the film from the top when sound is turned on
      v.play().catch(() => {});
      event('intro_video', { action: 'sound_on' });
    }
  };

  return (
    <div
      className={`fixed z-[90] left-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] lg:left-6 lg:bottom-6 w-[96px] sm:w-[120px] lg:w-[150px] aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-black/10 transition-all duration-300 ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover cursor-pointer"
        poster={`${SRC}-poster.webp`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggleSound}
        onError={() => setOpen(false)}
        aria-label="Priority Bags brand film. Tap for sound."
      >
        <source src={`${SRC}.webm`} type="video/webm" />
        <source src={`${SRC}.mp4`} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={close}
        aria-label="Close video"
        className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75"
      >
        <X size={14} />
      </button>
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75"
      >
        {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
    </div>
  );
};
