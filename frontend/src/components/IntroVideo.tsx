import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { event } from '../lib/gtag';

// Brand film. Opens as a player in the centre of the screen; pressing X (or
// tapping outside) shrinks it into a small corner player that keeps looping
// muted while people browse. X on the corner player hides it for a day.

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
  const [centred, setCentred] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!open) return null;

  const minimise = () => {
    event('intro_video', { action: 'minimised' });
    setCentred(false);
  };

  const close = () => {
    try { localStorage.setItem(CLOSED_KEY, String(Date.now())); } catch { /* storage blocked */ }
    event('intro_video', { action: 'closed' });
    setOpen(false);
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

  const btn =
    'absolute flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75';

  return (
    <>
      <AnimatePresence>
        {centred && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[89] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={minimise}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        role={centred ? 'dialog' : undefined}
        aria-label="Priority Bags brand film"
        className={
          centred
            ? 'fixed z-[90] inset-0 m-auto h-[min(78vh,560px)] max-w-[90vw] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl'
            : 'fixed z-[90] left-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] lg:left-6 lg:bottom-6 w-[96px] sm:w-[120px] lg:w-[150px] aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-black/10'
        }
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
          onClick={centred ? minimise : close}
          aria-label={centred ? 'Minimise video' : 'Close video'}
          className={`${btn} ${centred ? 'top-3 right-3 h-10 w-10' : 'top-1 right-1 h-7 w-7'}`}
        >
          <X size={centred ? 20 : 14} />
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className={`${btn} ${centred ? 'bottom-3 right-3 h-10 w-10' : 'bottom-1 right-1 h-7 w-7'}`}
        >
          {muted ? <VolumeX size={centred ? 18 : 13} /> : <Volume2 size={centred ? 18 : 13} />}
        </button>
      </motion.div>
    </>
  );
};
