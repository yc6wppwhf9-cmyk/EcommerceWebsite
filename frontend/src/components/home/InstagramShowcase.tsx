import { Instagram } from 'lucide-react';
import { LazyImage } from '../LazyImage';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';

/**
 * "#ExplorePriorityBags" — a strip that showcases the brand's Instagram feed.
 *
 * Each tile links to a real Priority Bags reel. The thumbnails use on-site
 * creatives as stand-ins (Instagram post images can't be hot-linked); swap
 * `POSTS[i].img` for a matching still if you export one per reel.
 */
const POSTS: { img: string; alt: string; href: string }[] = [
  { img: '/Category/Backpack.jpg',       alt: 'Priority Bags reel', href: 'https://www.instagram.com/priority.bags/reel/DcgZ4RKs6sF/' },
  { img: '/Creatives/5.png',             alt: 'Priority Bags reel', href: 'https://www.instagram.com/priority.bags/reel/DcOa_A0Mq0_/' },
  { img: '/Category/Travelling Bag.jpg', alt: 'Priority Bags reel', href: 'https://www.instagram.com/priority.bags/reel/Dbs3pehsDVz/' },
  { img: '/Creatives/4.png',             alt: 'Priority Bags reel', href: 'https://www.instagram.com/priority.bags/reel/DbbJMcSsArC/' },
];

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

      {/* Post grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        {POSTS.map((post) => (
          <a
            key={post.href}
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden rounded-sm bg-gray-100"
            aria-label={post.alt}
          >
            <LazyImage
              src={post.img}
              alt={post.alt}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              width={400}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
              <Instagram
                size={26}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                strokeWidth={2}
              />
            </div>
          </a>
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
