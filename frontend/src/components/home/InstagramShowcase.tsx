import { useState, useRef, useEffect } from 'react';
import { Instagram, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3';

interface InstagramCardData {
  handle: string;
  avatar: string;
  avatarFallback: string;
  posts: string;
  followers: string;
  following: string;
  img: string;
  fallback: string;
  href: string;
  caption: string;
}

const INSTA_CARDS: InstagramCardData[] = [
  {
    handle: 'priority.bags',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '3,644',
    followers: '183K',
    following: '96',
    img: '/Category/Backpack.jpg',
    fallback: '/Creatives/1.png',
    href: 'https://www.instagram.com/reel/DcgZ4RKs6sF/',
    caption: 'Chikankari charm & urban journeys tailored for you',
  },
  {
    handle: 'priority_travel',
    avatar: '/Priority Logo-02.png',
    avatarFallback: '/priority-icon.png',
    posts: '2,202',
    followers: '154K',
    following: '60',
    img: '/Creatives/2.png',
    fallback: '/Category/Travelling Bag.jpg',
    href: 'https://www.instagram.com/reel/DcOa_A0Mq0_/',
    caption: 'Timeless classics inspired by minimalism & travel',
  },
  {
    handle: 'priority_lifestyle',
    avatar: '/Priority Logo-02.png',
    avatarFallback: '/logo.png',
    posts: '1,840',
    followers: '143K',
    following: '48',
    img: '/Category/Artboard 1 1.png',
    fallback: '/Creatives/3.png',
    href: 'https://www.instagram.com/reel/Dbs3pehsDVz/',
    caption: 'Aesthetically co-ordinated everyday styles for life',
  },
  {
    handle: 'priority_driphouse',
    avatar: '/priority-icon.png',
    avatarFallback: '/Priority Logo-02.png',
    posts: '950',
    followers: '67K',
    following: '24',
    img: '/Category/ref.png',
    fallback: '/Creatives/4.png',
    href: 'https://www.instagram.com/reel/DbbJMcSsArC/',
    caption: 'Fresh Fits. Real Vibes. Ready for every road.',
  },
  {
    handle: 'traworld_official',
    avatar: '/traworld-icon.png',
    avatarFallback: '/Traworld/nav bar logo.png',
    posts: '1,280',
    followers: '198K',
    following: '32',
    img: '/Traworld/section 2.png',
    fallback: '/Traworld/hero.png',
    href: 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3',
    caption: 'Luxury travel luggage crafted for world wanderers',
  },
  {
    handle: 'priority_junior',
    avatar: '/junior/junior logo.png',
    avatarFallback: '/priority-icon.png',
    posts: '840',
    followers: '112K',
    following: '15',
    img: '/junior/junior hero.png',
    fallback: '/junior/Dreamy.png',
    href: 'https://www.instagram.com/priority.bags?igsh=OXJ6d3I5MXM0djU3',
    caption: 'Vibrant & ergonomic bags for young dreamers',
  },
];

const InstagramCard = ({ card }: { card: InstagramCardData }) => {
  const [imgSrc, setImgSrc] = useState(card.img);
  const [avatarSrc, setAvatarSrc] = useState(card.avatar);

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-[270px] sm:w-[290px] md:w-[310px] bg-white rounded-3xl border border-gray-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden snap-start"
    >
      {/* Card Header: Profile Info & Stats */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full border border-gray-200 p-0.5 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={avatarSrc}
              alt={card.handle}
              onError={() => avatarSrc !== card.avatarFallback && setAvatarSrc(card.avatarFallback)}
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 text-center gap-1">
            <div className="flex flex-col">
              <span className="font-bold text-[12px] sm:text-[13px] text-gray-900 leading-tight">
                {card.posts}
              </span>
              <span className="text-[10px] text-gray-500 font-normal leading-none mt-0.5">
                posts
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[12px] sm:text-[13px] text-gray-900 leading-tight">
                {card.followers}
              </span>
              <span className="text-[10px] text-gray-500 font-normal leading-none mt-0.5">
                followers
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[12px] sm:text-[13px] text-gray-900 leading-tight">
                {card.following}
              </span>
              <span className="text-[10px] text-gray-500 font-normal leading-none mt-0.5">
                following
              </span>
            </div>
          </div>

          {/* 3 dots menu */}
          <div className="text-gray-400 pl-1">
            <MoreVertical size={16} />
          </div>
        </div>

        {/* Username handle */}
        <div className="mt-2.5">
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">
            {card.handle}
          </span>
        </div>
      </div>

      {/* Main Post Image */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={card.caption}
          loading="lazy"
          onError={() => imgSrc !== card.fallback && setImgSrc(card.fallback)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Subtle Instagram hover badge */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-md">
            <Instagram size={20} />
          </div>
        </div>
      </div>

      {/* Card Footer: Action Icons & Caption */}
      <div className="p-4 pt-3 flex flex-col gap-2.5">
        {/* Icons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Red Heart */}
            <svg className="w-5 h-5 fill-[#ED4956] text-[#ED4956]" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            {/* Comment Bubble */}
            <svg className="w-5 h-5 text-gray-800 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.818-.817c.07-.464.204-1.02.39-1.637A8.13 8.13 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>

            {/* Send / Airplane */}
            <svg className="w-5 h-5 text-gray-800 -rotate-12 transform" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>

          {/* Bookmark */}
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>

        {/* Caption */}
        <p className="text-[12px] sm:text-[13px] text-gray-800 font-medium leading-snug line-clamp-2">
          {card.caption}
        </p>
      </div>
    </a>
  );
};

export const InstagramShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [cards, setCards] = useState<InstagramCardData[]>(INSTA_CARDS);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Live Auto-Sync: Fetch from Instagram Feed API if configured
  useEffect(() => {
    const feedUrl =
      import.meta.env.VITE_INSTAGRAM_FEED_URL ||
      (import.meta.env.VITE_BEHOLD_FEED_ID
        ? `https://feeds.behold.so/${import.meta.env.VITE_BEHOLD_FEED_ID}`
        : null);

    if (!feedUrl) return;

    let isMounted = true;
    setIsLoadingFeed(true);

    fetch(feedUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data) return;
        const postsList = Array.isArray(data) ? data : data.data || [];
        if (postsList.length === 0) return;

        const liveCards: InstagramCardData[] = postsList.slice(0, 8).map((item: any, idx: number) => {
          const img = item.thumbnailUrl || item.thumbnail_url || item.mediaUrl || item.media_url || INSTA_CARDS[idx % INSTA_CARDS.length].img;
          const href = item.permalink || item.url || INSTAGRAM_URL;
          const caption = item.caption ? item.caption.split('\n')[0] : 'Explore new journeys with Priority Bags';
          const handle = item.username || 'priority.bags';

          return {
            handle: handle.startsWith('@') ? handle.substring(1) : handle,
            avatar: '/priority-icon.png',
            avatarFallback: '/Priority Logo-02.png',
            posts: '3,644',
            followers: '183K',
            following: '96',
            img,
            fallback: INSTA_CARDS[idx % INSTA_CARDS.length].fallback,
            href,
            caption: caption.length > 80 ? caption.substring(0, 77) + '...' : caption,
          };
        });

        if (liveCards.length > 0) {
          setCards(liveCards);
        }
      })
      .catch((err) => {
        console.warn('Instagram live feed load error, using cached posts:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingFeed(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cards]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -330 : 330;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section
      className="bg-[#FAFAFA] border-t border-gray-100 font-outfit py-14 md:py-20 relative overflow-hidden"
      aria-label="Explore Priority Bags on Instagram"
    >
      <div className="max-w-[1720px] mx-auto px-4 md:px-10">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center gap-2 mb-8 md:mb-12">
          <div className="flex items-center gap-2.5">
            <Instagram size={22} className="text-[#0F1417]" strokeWidth={2} />
            <h2 className="font-outfit font-bold text-[18px] md:text-[24px] tracking-[0.06em] text-[#0F1417]">
              EXPLORE <span className="text-[#26B3FF]">#PriorityBags</span>
            </h2>
          </div>
          <p className="text-[12px] md:text-[13px] font-medium text-gray-500 max-w-md">
            Tag <span className="font-semibold text-[#0F1417]">@priority.bags</span> for a chance to be featured. Here's how our community carries it.
          </p>
        </div>

        {/* Carousel Container with Floating Controls */}
        <div className="relative group/carousel max-w-[1400px] mx-auto">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} strokeWidth={2.2} />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-gray-200/80 flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight size={22} strokeWidth={2.2} />
            </button>
          )}

          {/* Cards Scroll Deck */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2 md:px-4"
          >
            {cards.map((card) => (
              <InstagramCard key={card.handle + card.img + card.caption} card={card} />
            ))}
          </div>
        </div>

        {/* Section Bottom CTA */}
        <div className="flex justify-center mt-8 md:mt-12">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#0F1417] text-white px-8 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#26B3FF] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <Instagram size={16} strokeWidth={2.2} />
            Follow @priority.bags
          </a>
        </div>
      </div>
    </section>
  );
};
