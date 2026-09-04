import { useState } from 'react';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';

/**
 * "#ExplorePriorityBags" — showcases real Priority Bags reels as clean portrait
 * tiles (no Instagram chrome).
 *
 * Each tile shows a self-hosted cover from `public/instagram/` and links to its
 * reel. Drop the four covers in as `reel1.jpg`…`reel4.jpg` (pre-cropped so the
 * Instagram view-count bar isn't included). Until a file exists the tile falls
 * back to an on-site creative via `onError`, so the section never shows a broken
 * image.
 */
const POSTS = [
  { img: '/instagram/reel1.jpg', fallback: '/Category/Backpack.jpg',       href: 'https://www.instagram.com/reel/DcgZ4RKs6sF/', alt: 'Priority Junior reel' },
  { img: '/instagram/reel2.jpg', fallback: '/Creatives/2.png',             href: 'https://www.instagram.com/reel/DcOa_A0Mq0_/', alt: 'Priority Junior reel' },
  { img: '/instagram/reel3.jpg', fallback: '/Category/Travelling Bag.jpg', href: 'https://www.instagram.com/reel/Dbs3pehsDVz/', alt: 'Priority Junior reel' },
  { img: '/instagram/reel4.jpg', fallback: '/junior/junior hero.png',      href: 'https://www.instagram.com/reel/DbbJMcSsArC/', alt: 'Priority Junior reel' },
];

const ReelTile = ({ img, fallback, href, alt }: (typeof POSTS)[number]) => {
  const [src, setSrc] = useState(img);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => src !== fallback && setSrc(fallback)}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
        <Instagram
          size={30}
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          strokeWidth={2}
        />
      </div>
    </a>
  );
};

export const InstagramShowcase = () => (
  <section className="bg-white border-t border-gray-100 font-outfit py-14 md:py-20" aria-label="Explore Priority Bags on Instagram">
    <div className="max-w-[1720px] mx-auto px-4 md:px-10">
      {/* Heading */}
      <div className="flex flex-col items-center text-center gap-2 mb-8 md:mb-10">
        <div className="flex items-center gap-2.5">
          <Instagram size={22} className="text-[#0F1417]" strokeWidth={2} />
          <h2 className="font-outfit font-bold text-[18px] md:text-[24px] tracking-[0.06em] text-[#0F1417]">
            EXPLORE <span className="text-[#26B3FF]">#PriorityBags</span>
          </h2>
        </div>
        <p className="text-[12px] md:text-[13px] font-medium text-gray-500 max-w-md">
          Tag <span className="font-semibold text-[#0F1417]">@priority.bags</span> for a chance to be featured. Here's how our travellers carry it.
        </p>
      </div>

      {/* Reel tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-[1120px] mx-auto">
        {POSTS.map((post) => (
          <ReelTile key={post.href} {...post} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-8 md:mt-10">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#0F1417] text-white px-7 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#26B3FF] transition-colors duration-300"
        >
          <Instagram size={16} strokeWidth={2.2} />
          Follow @priority.bags
        </a>
      </div>
    </div>
  </section>
);
