import { useEffect, useRef, useState } from 'react';
import { Instagram, Play, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, stagger, revealProps } from '../../lib/motion';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';
const HANDLE = 'priority.bags';
const FOLLOWERS = '13.1K';
const POSTS = '366';

const IG_GRADIENT = 'bg-[linear-gradient(45deg,#F58529_0%,#DD2A7B_50%,#8134AF_100%)]';

interface InstagramPost {
  img: string;
  fallback: string;
  video?: string;
  href: string;
  caption: string;
}

const POSTS_DATA: InstagramPost[] = [
  {
    img: '/instagram/post_1.webp',
    fallback: '/Category/Backpack.jpg',
    href: 'https://www.instagram.com/p/Dc2xRsrjKxT/',
    caption: 'Your backpack has a personality. Meet the DREAMER Series.',
  },
  {
    img: '/instagram/post_2.jpg',
    fallback: '/junior/Drift Sky Blue_ Hero 1.png',
    href: 'https://www.instagram.com/p/DbLf5MnDKPL/',
    caption: 'Meet the Drift Series combo! The ultimate school day survival kit.',
  },
  {
    img: '/instagram/post_3_best.jpg',
    video: '/instagram/post_3.mp4',
    fallback: '/instagram/post_3.jpg',
    href: 'https://www.instagram.com/p/DcgZ4RKs6sF/',
    caption: 'Discover the "Snappy" backpack in every color. Fast, fresh & ready.',
  },
  {
    img: '/instagram/post_4_best.jpg',
    video: '/instagram/post_4.mp4',
    fallback: '/instagram/post_4.jpg',
    href: 'https://www.instagram.com/p/DbbJMcSsArC/',
    caption: 'Infused thermal lining & 1-swipe clean pockets. Upgrade your school game!',
  },
  {
    img: '/instagram/post_5.webp',
    fallback: '/Category/Artboard 1 1.png',
    href: 'https://www.instagram.com/p/DcvzxuRM0vG/',
    caption: 'INCOMING! The ultimate semester essential straight to your feed. #Century',
  },
];

/**
 * "Seen on Instagram" gallery.
 * - Mobile/tablet: bento grid (featured post + 2×2); reels autoplay (muted) while in view.
 * - Desktop: 5-up editorial grid; reels play on hover, captions slide up.
 */
export const InstagramShowcase = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="bg-white border-t border-gray-100 font-outfit py-12 md:py-20 overflow-hidden"
      aria-label="Explore Priority Bags on Instagram"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="px-4 md:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10 text-center md:text-left">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate mb-3">
              Seen on Instagram
            </p>
            <h2 className="font-bold text-[26px] sm:text-[32px] md:text-[40px] leading-[1.05] tracking-tight text-ink">
              #PriorityBags <span className="text-gray-400 font-medium">in the wild</span>
            </h2>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden md:inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white pl-1.5 pr-5 py-1.5 hover:border-transparent hover:shadow-[0_10px_30px_-12px_rgba(221,42,123,0.45)] transition-all duration-300"
          >
            <span className={`w-11 h-11 rounded-full p-[2px] ${IG_GRADIENT}`}>
              <span className="w-full h-full rounded-full bg-white p-[3px] flex items-center justify-center">
                <img src="/priority-icon.png" alt="" className="w-full h-full rounded-full object-contain" />
              </span>
            </span>
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[14px] font-semibold text-ink">@{HANDLE}</span>
              <span className="text-[12px] text-gray-500">
                {FOLLOWERS} followers · {POSTS} posts
              </span>
            </span>
            <span className="ml-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-ink text-white text-[11px] font-semibold uppercase tracking-[0.16em] group-hover:bg-[linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)] transition-colors">
              Follow
            </span>
          </a>
        </div>

        {/* Gallery */}
        <motion.ul
          className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-5 px-4 md:px-8"
          variants={stagger(0.08)}
          {...revealProps(reduceMotion)}
        >
          {POSTS_DATA.map((post, i) => (
            <motion.li
              key={post.href}
              variants={fadeUp}
              className={i === 0 ? 'col-span-2 lg:col-span-1' : undefined}
            >
              <PostTile post={post} />
            </motion.li>
          ))}
        </motion.ul>

        {/* Mobile follow CTA (desktop shows the profile pill in the header) */}
        <div className="md:hidden px-4 mt-6">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-full bg-ink text-white text-[11px] font-semibold uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
          >
            <Instagram size={16} /> Follow @{HANDLE}
          </a>
          <p className="mt-2.5 text-center text-[12px] text-gray-500">
            {FOLLOWERS} followers · {POSTS} posts
          </p>
        </div>
      </div>
    </section>
  );
};

const PostTile = ({ post }: { post: InstagramPost }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(post.img);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  // Touch devices have no hover: play reels while they're mostly on screen.
  useEffect(() => {
    if (!post.video || !ref.current) return;
    if (!window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.intersectionRatio >= 0.7 ? play() : stop()),
      { threshold: [0, 0.7] },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [post.video]);

  return (
    <a
      ref={ref}
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open on Instagram: ${post.caption}`}
      onMouseEnter={post.video ? play : undefined}
      onMouseLeave={post.video ? stop : undefined}
      className="group relative block aspect-square lg:aspect-[4/5] rounded-xl lg:rounded-2xl overflow-hidden bg-gray-100"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setSrc(post.fallback)}
        className={`absolute inset-0 w-full h-full object-cover transition-[transform,opacity] duration-[1.2s] ease-out group-hover:scale-[1.04] ${
          playing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {post.video && (
        <video
          ref={videoRef}
          src={post.video}
          muted
          loop
          playsInline
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Reel badge */}
      {post.video && (
        <span className="absolute top-2 right-2 lg:top-3 lg:right-3 w-7 h-7 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white">
          <Play size={12} className="fill-current ml-0.5" />
        </span>
      )}

      {/* Caption: desktop only, slides up on hover */}
      <div className="hidden lg:block absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-left lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500">
        <p className="text-white text-[12px] md:text-[13px] leading-snug font-medium line-clamp-2">
          {post.caption}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
          <Instagram size={12} /> View post <ArrowUpRight size={12} />
        </span>
      </div>
    </a>
  );
};
